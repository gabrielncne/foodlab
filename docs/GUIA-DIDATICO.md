# FoodMatch AI: como construímos a ferramenta, passo a passo

Este guia acompanha o código entregue. Você pode lê-lo como uma aula e abrir os arquivos citados ao lado. A implementação final foi feita com assistência de IA a seu pedido; o objetivo agora é permitir que você entenda, teste e explique as decisões.

## 1. Começamos pela pergunta do produto

“Quais restaurantes disponíveis combinam com o que quero comer e com meu orçamento?” Essa pergunta mistura duas decisões diferentes: quais restaurantes podem participar e em que ordem apresentar os participantes.

No MVP, categoria e orçamento são restrições. Se a pessoa escolheu Japonesa, só restaurantes dessa categoria participam. Se escolher “Quero descobrir”, todas as categorias podem participar. O orçamento usa preço médio mais entrega e é apresentado como estimativa.

Afinidade textual, avaliação e prazo participam da ordenação. Dar mais peso à avaliação não autoriza ultrapassar o orçamento. A ordem das responsabilidades importa: primeiro garantimos elegibilidade, depois comparamos opções.

## 2. Aproveitamos o que você já tinha aprendido

No exercício `exploracao/explorar_dados.py`, você carregou JSON, percorreu uma lista de dicionários, calculou custo, aplicou `if`, acumulou aprovados com `append()` e usou `sorted()`.

Essas operações continuam no sistema final, agora com responsabilidades separadas. O código do exercício foi preservado como registro de aprendizagem; não é importado pela API. A implementação utilizada pelo aplicativo está em `backend/`.

## 3. Mantivemos uma fonte única de dados

`src/data/restaurants.json` contém 12 restaurantes fictícios. O React já o usava no catálogo. O backend lê esse mesmo arquivo, evitando uma segunda lista com IDs, preços ou nomes divergentes.

`backend/catalog.py` encontra o arquivo a partir de `__file__`, isto é, da localização do módulo Python. Não depende de onde o terminal foi aberto. Em seguida, valida os registros e verifica IDs repetidos e intervalos de entrega inválidos.

O `id` identifica o restaurante. Posição na lista serve para alinhar documentos e vetores, mas não substitui a identidade do item. O recomendador mantém a matriz e a sequência original juntas, de modo que o vetor da linha i corresponde ao restaurante da posição i.

## 4. Criamos contratos com Pydantic

Em `backend/schemas.py`, os modelos descrevem o formato dos dados e suas regras. Uma anotação como `budget: float | None` significa número ou ausência de limite. Validações adicionais impedem orçamento negativo, infinito, booleano ou texto.

Categoria e prioridade têm valores permitidos. A descrição aceita até 500 caracteres. O limite de resultados fica entre 1 e 12. Campos desconhecidos são rejeitados, o que ajuda a identificar erros de integração em vez de ignorá-los silenciosamente.

Isso não treina um modelo. É validação de dados na fronteira HTTP. Entrada inválida produz resposta 422, permitindo que o frontend explique que a consulta não foi aceita.

## 5. Construímos um texto para cada restaurante

Abra `restaurant_text()` em `backend/recommender.py`. A função junta categoria, descrição e tags com espaços. Um documento pode conter “Japonesa tradição japonesa ... sushi salmão fresco”.

Não incluímos preço ou avaliação como palavras. Esses atributos já têm significado numérico e funções próprias. Tampouco usamos o nome como principal sinal de afinidade, pois o nome pode acrescentar ruído de marca sem explicar a culinária.

As opções alimentares não entram como garantia de segurança. O catálogo não descreve ingredientes completos de cada prato nem contaminação cruzada. A interface informa que alergias e restrições alimentares não são avaliadas.

## 6. Transformamos palavras em números com TF-IDF

Para calcular afinidade, precisamos colocar todos os documentos no mesmo espaço de características. Pense em uma tabela em que cada linha é um restaurante e cada coluna é uma palavra ou expressão do vocabulário.

TF representa a presença/frequência de um termo no documento. IDF reduz o peso de termos que aparecem em muitos documentos e aumenta relativamente o de termos mais distintivos. Neste projeto, usamos a implementação `TfidfVectorizer` do scikit-learn.

Com suavização padrão, a ideia do IDF é `log((1 + N) / (1 + df)) + 1`, em que N é o total de documentos e df é o número de documentos com o termo. Com `sublinear_tf=True`, frequências positivas usam `1 + log(tf)` antes da multiplicação pelo IDF. Por fim, os vetores são normalizados em L2.

Não é necessário memorizar a fórmula para usar a biblioteca, mas você deve conseguir explicar por que “salmão” pode distinguir restaurantes melhor que uma palavra comum em quase todas as descrições.

As configurações escolhidas são explícitas:

- Minúsculas para aproximar “SUSHI” de “sushi”.
- Remoção de acentos para aproximar “salmão” de “salmao”.
- Lista pequena e visível de palavras comuns em português para reduzir ruído.
- Unigramas e bigramas: palavras individuais e pares consecutivos produzidos pelo analisador.
- TF sublinear para reduzir o efeito de repetição excessiva de uma palavra.

O ajuste `fit_transform()` acontece uma vez na inicialização sobre todo o catálogo. Para cada consulta, usamos apenas `transform()`. Se ajustássemos um novo vocabulário só com a consulta, seus vetores poderiam ter colunas diferentes das colunas dos restaurantes.

Esse ajuste é não supervisionado: não há rótulos de compra ou notas pessoais ensinando respostas corretas. O sistema aprende estatísticas dos textos do catálogo, não o comportamento individual do usuário.

## 7. Representamos a preferência no mesmo vocabulário

Quando há descrição livre, ela é a consulta textual. Se a descrição estiver vazia e houver categoria, usamos a categoria como texto. A categoria continua funcionando como filtro obrigatório, independentemente da consulta.

Palavras desconhecidas não ganham automaticamente significado. Se alguém escrever somente um termo fora do vocabulário, o vetor pode ficar zerado. Nesse caso, o sistema informa que usou uma ordenação alternativa por nota e prazo, mantendo categoria e orçamento.

Se a consulta tiver termos reconhecidos, mas nenhum restaurante elegível compartilhar características, a resposta é vazia. Não completamos a lista com itens sem relação apenas para preencher seis cards.

## 8. Calculamos similaridade de cosseno

A similaridade de cosseno compara a direção de dois vetores: `cosseno(q, d) = produto_escalar(q, d) / (norma(q) * norma(d))`.

Com vetores TF-IDF não negativos, os resultados ficam entre 0 e 1: zero indica ausência de sobreposição nas características e valores maiores indicam maior alinhamento. Não significa “probabilidade de o usuário gostar” nem “porcentagem de acerto”.

Imagine dois restaurantes com textos semelhantes sobre sushi e salmão e outro sobre pizza. A consulta “sushi salmão” tende a se alinhar mais aos primeiros, porque há características compartilhadas.

TF-IDF continua sendo lexical. “Sem queijo” ainda contém “queijo”; ele não entende essa intenção como um humano. Sinônimos sem palavras compartilhadas também podem falhar. Essas limitações justificam não prometer compreensão semântica completa.

## 9. Aplicamos filtros e prioridades separadamente

Categoria e custo estimado determinam os índices elegíveis. O custo é calculado com `Decimal` para evitar problemas como `0.1 + 0.2` produzir um resultado binário ligeiramente acima de `0.3` numa comparação de limite.

Entre os elegíveis com afinidade positiva, o score combina três sinais:

`score = peso_texto * similaridade + peso_nota * (rating / 5) + peso_prazo * (1 - min(deliveryMax, 90) / 90)`.

Na prioridade de afinidade, os pesos são 0,85, 0,10 e 0,05. Na prioridade de avaliação, 0,60, 0,35 e 0,05. Na de entrega, 0,60, 0,05 e 0,35. O teto de 90 minutos e os pesos são decisões heurísticas de MVP, não resultados de otimização com usuários.

Em empate, usamos afinidade, avaliação, prazo e ID para que a resposta seja estável. Essa estabilidade facilita depuração e testes. Não há aleatoriedade na recomendação.

Quando não há vocabulário reconhecido, não usamos esses pesos de afinidade: ela não existe nessa consulta. A alternativa usa nota e prazo, com 80/20 ou 20/80 de acordo com a prioridade, e comunica essa mudança na resposta.

## 10. Construímos justificativas verificáveis

Cada card pode explicar a culinária, o custo estimado, a prioridade e até três termos em comum. Os termos são extraídos das contribuições compartilhadas dos vetores. Podem aparecer sem acentos porque vêm do vocabulário normalizado.

Não pedimos a um LLM para inventar uma justificativa convincente. A explicação é montada com dados reais daquela consulta. Score, similaridade e termos compartilhados também ficam disponíveis na resposta HTTP para inspeção.

## 11. Expusemos a lógica em uma API

`backend/main.py` cria a aplicação FastAPI. O `lifespan` carrega o catálogo e ajusta o recomendador antes de aceitar requisições. Isso evita refazer a matriz a cada clique.

`GET /api/health` permite verificar se o processo está ativo. `POST /api/recommendations` recebe as preferências validadas e chama o recomendador. O modelo de resposta padroniza o JSON retornado.

Falha de validação é diferente de ausência de resultados. Consulta válida sem opções devolve 200 e uma lista vazia. Entrada inválida devolve 422. Um erro inesperado devolve 500 com mensagem genérica, sem expor uma pilha interna de execução ao navegador.

O processamento da recomendação usa um endpoint síncrono, adequado para essa pequena operação de CPU. Não há banco de dados nem chamadas externas no fluxo de inferência.

## 12. Conectamos o React ao backend

Em `src/services/recommendations.ts`, `fetch()` envia um POST com JSON. O serviço verifica o status HTTP e a estrutura básica da resposta antes de devolver dados à página.

Em `FoodMatchPage.tsx`, `handleSubmit()` registra as escolhas, entra em loading, navega para resultados e aguarda a resposta. Em sucesso, a página passa itens e mensagem para `FoodMatchResults`. Em erro, mostra uma explicação e permite tentar novamente.

`AbortController` cancela uma consulta ao sair, editar ou iniciar outra. Um contador de requisições impede que uma resposta antiga substitua uma mais nova. Um timeout de 12 segundos evita espera indefinida. Não há temporizador fingindo que um algoritmo está trabalhando: o loading acompanha a requisição real.

O frontend não recalcula rankings nem inventa restaurantes. Ele preserva a ordem devolvida pelo backend. Favoritos continuam sendo uma função local do catálogo e não entram no treinamento.

## 13. Simplificamos a execução local

No desenvolvimento, o Vite serve React e encaminha `/api` para FastAPI. No modo completo, `npm start` usa `scripts/serve.mjs` para iniciar FastAPI com o Python da `.venv`; FastAPI serve também o build `dist/`.

Isso permite uma demonstração em um endereço só. Rotas do React, como `/foodmatch/resultados`, abrem diretamente e recarregam sem 404 do servidor. Caminhos desconhecidos de API continuam sendo erros JSON, e não recebem acidentalmente o HTML do aplicativo.

## 14. Testamos comportamento, não apenas execução

Os testes verificam limites de orçamento, valores inválidos, filtros, prioridades, consultas desconhecidas, vocabulário estável, ausência de mutação dos dados, respostas HTTP e publicação local das rotas.

No navegador, o fluxo foi exercitado com Japonesa: orçamento 60 devolve Koji Sushi; 40 mostra estado vazio; 100 devolve duas opções. Também foram verificadas edição das escolhas e larguras de 390 e 1440 pixels, sem transbordamento horizontal da página.

Uma avaliação adicional compara quatro consultas simples com um baseline que sempre escolhe as maiores notas. Precision@2 é a quantidade de itens considerados relevantes entre os dois primeiros, dividida por dois. A relevância foi definida por categoria no próprio cenário sintético.

O resultado favorável desse ensaio não comprova qualidade em produção. Ele é pequeno, tem vocabulário fácil e não usa usuários reais. Foi incluído para ensinar a diferença entre teste de funcionamento e avaliação de recomendação, e para estabelecer um ponto de partida reproduzível.

## 15. Como explicar em uma entrevista

Uma apresentação honesta pode ser: “Construí um MVP de recomendação baseada em conteúdo com catálogo fictício. Representei restaurantes com TF-IDF, comparei preferências por cosseno e combinei afinidade com regras explícitas de orçamento, culinária e prioridade. Expus a lógica em FastAPI e conectei um frontend React. A implementação final teve assistência de IA; consigo explicar e testar as decisões, os pesos e as limitações.”

Para estudar, tente responder sem consultar o código:

1. Por que o vocabulário é ajustado uma vez e reutilizado na consulta?
2. O que acontece se o texto contiver apenas palavras desconhecidas?
3. Por que boa avaliação não pode furar um orçamento obrigatório?
4. Por que score 0,8 não significa 80% de chance de gostar?
5. Como você avaliaria o recomendador com usuários e dados reais?
6. O que mudaria se o catálogo tivesse 100 mil restaurantes?

Próximos avanços possíveis: dados reais, julgamentos humanos de relevância, pesos calibrados, sinônimos/embeddings avaliados contra baseline, persistência de interações e preparação de infraestrutura. Cada avanço precisa de uma hipótese e de uma forma de avaliar se melhorou o produto.

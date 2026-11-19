# Validação final — FoodMatch AI

Data: 17/11/2026. Ambiente: Windows, Python 3.15.2 e stack React/TypeScript/Vite existente.

## Verificações

- Build de produção e TypeScript: aprovados.
- Suíte Python: 40 testes aprovados na execução final.
- Regras: categoria, orçamento, limites inclusivos e soma decimal, ausência de candidatos, prioridade, limite de resultados, determinismo, vocabulário estável e dados sem mutação.
- API: health, contrato de resposta, 422 para entradas inválidas e números não finitos, 404 JSON para endpoints desconhecidos, CORS local e resolução do catálogo independente do diretório do terminal.
- Servidor completo: rotas do React devolvem index.html e arquivos ausentes com extensão continuam 404.
- Navegador com requisição real: Japonesa + “sushi salmão” + orçamento 60 devolve Koji Sushi; 40 devolve lista vazia; 100 devolve Sushi Prime e Koji Sushi com razões.
- Edição das preferências: escolhas mantidas durante a navegação interna.
- Responsividade: resultados inspecionados em 390 x 844 e 1440 x 960; largura do documento não ultrapassou o viewport.
- Console do navegador: nenhum erro capturado durante esses cenários.

## Reproduzir

```powershell
npm.cmd run build
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m backend.evaluate
```

A suíte atualmente emite um aviso de depreciação de Starlette sobre seu transporte de testes com httpx. Não houve falha funcional; as versões efetivamente utilizadas estão fixadas no lock. Esse aviso deve ser acompanhado em uma atualização futura das dependências.

## Ensaio de recomendação

Quatro consultas sintéticas: sushi/salmão, pizza/massa, burger/hambúrguer e salada/bowl. Relevância definida pela categoria esperada. K=2; itens não retornados não contam como acerto. Baseline seleciona as maiores notas sem considerar texto.

| Método           | Precision@2 média |
| ---------------- | ----------------: |
| TF-IDF + cosseno |              1,00 |
| Maior avaliação  |             0,125 |

Relatório reproduzível: evaluation-results.json. Não houve coleta com usuários nem conjunto externo de avaliação. Essas consultas são fáceis e usam o vocabulário do catálogo, portanto os números não estimam qualidade real, generalização ou probabilidade de satisfação.

## Limites da verificação

Foram verificados os fluxos locais descritos. Não foram feitos testes de carga, acessibilidade com leitores de tela, pesquisa com usuários, pentest ou implantação pública. O timeout e a proteção contra respostas antigas existem no código; os cenários de atraso e corrida não foram exercitados por automação de navegador nesta entrega.

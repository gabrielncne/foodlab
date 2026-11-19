# Interface FoodMatch e integração

A interface agora está conectada à API Python. O formulário envia preferências reais para `POST /api/recommendations`; não existem respostas fixas nem processamento simulado.

## Arquivos

- `src/components/FoodMatchForm.tsx`: categoria, orçamento, prioridade e texto opcional; formulário controlado pela página.
- `src/pages/FoodMatchPage.tsx`: preferências temporárias, envio, timeout, cancelamento e estado da consulta.
- `src/services/recommendations.ts`: fetch, tratamento de status HTTP e validação básica da resposta.
- `src/types/foodmatch.ts`: contratos TypeScript correspondentes à API.
- `src/components/FoodMatchResults.tsx`: estados inicial, carregando, erro, vazio e resultados; sem algoritmo no componente.
- `src/pages/foodmatch.css`: estilos responsivos.
- `backend/schemas.py`: validação dos mesmos conceitos no servidor.

## Contrato e regras

`category` aceita uma culinária ou null; `budget` aceita um número positivo ou null; `description` é texto opcional de até 500 caracteres; `priority` é relevance, rating ou delivery. O cliente pede até 6 itens.

A categoria selecionada funciona como filtro obrigatório. O orçamento é uma estimativa de preço médio mais entrega. “Quero descobrir” aceita todas as categorias. A descrição representa sabores desejados, sem promessa de entender negação, alergias ou restrições alimentares.

## Fluxo

1. Usuário preenche e envia o formulário.
2. Página guarda as escolhas em memória, entra em loading e abre resultados.
3. Serviço faz POST relativo para /api/recommendations.
4. Backend valida, filtra, calcula e devolve itens e uma mensagem contextual.
5. Página exibe resultados na ordem recebida; razões vêm do backend.
6. Consulta sem opções mostra o estado vazio e permite editar.
7. Erro oferece nova tentativa com as mesmas preferências.

Há timeout de 12 segundos. Editar, sair ou iniciar outra consulta cancela a anterior. Um contador impede respostas antigas de sobrescreverem as novas. Voltar pelo histórico do navegador também cancela a consulta ativa; não deixa um loading abandonado como resultado definitivo.

Preferências e resultados não são persistidos após recarregar ou sair da seção. Acesso direto a /foodmatch/resultados sem consulta mostra convite para escolher preferências. Favoritos continuam no localStorage e não são usados pelo modelo.

## Execução

No desenvolvimento, Vite encaminha /api para FastAPI em 127.0.0.1:8000. Depois de um build, npm start inicia FastAPI servindo a aplicação completa no mesmo endereço. Consulte o README para instalação e comandos.

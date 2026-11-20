# FoodLab 🍔

Criei o FoodLab para estudar Python, Machine Learning e como conectar uma API a uma aplicação React. É um app fictício de delivery com uma funcionalidade chamada **FoodMatch AI**, que sugere restaurantes a partir das preferências do usuário.

O desenvolvimento teve apoio de IA. Também deixei meus exercícios iniciais de Python na pasta `exploracao`.

## O que dá para fazer

- Buscar restaurantes e filtrar por categoria.
- Ver cardápios e salvar favoritos.
- Informar o que quer comer, o orçamento e sua prioridade.
- Receber sugestões de restaurantes com uma explicação simples.

## Tecnologias

- React, TypeScript e Vite
- Tailwind CSS
- Python e FastAPI
- scikit-learn

## Como funciona o FoodMatch

O sistema junta a categoria, a descrição e as tags de cada restaurante. Depois usa **TF-IDF** para transformar esses textos em números e **similaridade de cosseno** para comparar com o que o usuário procura.

A categoria escolhida e o orçamento filtram as opções. A avaliação e o prazo de entrega também ajudam na ordem dos resultados, dependendo da prioridade selecionada.

Se o texto não tiver palavras reconhecidas, o app avisa e usa avaliação e prazo para ordenar as opções disponíveis.

## Como rodar no Windows

Usei **Python 3.15.2** e **Node.js 22.12 ou superior**. Você também precisa do Git.

## Sobre os dados

Os restaurantes, preços e avaliações são fictícios. O orçamento considera preço médio + entrega, então é só uma estimativa. O app não realiza pedidos nem pagamentos e não tem vínculo com o iFood.

O recomendador compara palavras, então pode não entender sinônimos ou frases como “sem queijo”. Ele também não avalia alergias ou restrições alimentares.

## Mais detalhes

Deixei uma [explicação passo a passo](docs/GUIA-DIDATICO.md) e um [resumo dos testes e limitações](docs/VALIDACAO.md) na pasta `docs`.

Fotos ilustrativas do [Unsplash](https://unsplash.com/) e ícones do [Lucide](https://lucide.dev/).

# Resumo para commit e pull request

## Título sugerido

`feat(foodmatch): integrar recomendador TF-IDF ao FoodLab com FastAPI`

## Descrição de PR

O FoodMatch exibia apenas uma prévia das preferências. Agora o formulário consulta um backend Python e apresenta recomendações reais calculadas a partir do catálogo local. O sistema respeita categoria e orçamento estimado, calcula afinidade textual e combina prioridades de avaliação ou prazo.

### Alterações

- Adicionar backend FastAPI com contratos Pydantic, health check, validação de entrada e tratamento de erros.
- Implementar representação de categoria, descrição e tags com TF-IDF e similaridade de cosseno.
- Aplicar orçamento e categoria como filtros, com ranking ponderado e desempate determinístico.
- Adicionar modo alternativo explícito quando não há termos reconhecidos e estado vazio quando não há opções compatíveis.
- Gerar razões a partir de custo, categoria, prioridade e termos compartilhados.
- Conectar React à API com loading real, timeout, cancelamento, proteção contra respostas antigas e nova tentativa.
- Servir o frontend de produção pelo FastAPI e configurar proxy para desenvolvimento no Vite.
- Adicionar testes de regras e API, ensaio sintético de Precision@2 e baseline por avaliação.
- Documentar instalação, arquitetura, algoritmo, limitações, aprendizagem e preparação para GitHub.
- Preservar os exercícios Python originais e o catálogo existente.

### Validação

Consultar `docs/VALIDACAO.md` para os comandos e resultados finais. O build verifica TypeScript, a suíte testa o backend e o fluxo integrado foi exercitado no navegador. A avaliação sintética é um sanity check do pequeno catálogo, sem alegação de qualidade real com usuários.

### Limitações conhecidas

Dados fictícios; inferência lexical; ausência de histórico de interação, autenticação e infraestrutura pública; orçamento estimado e prazos estáticos. Pesos heurísticos e sem validação com usuários. Nenhum LLM ou serviço externo de inferência é necessário.

## Corpo de commit sugerido

```text
feat(foodmatch): integrar recomendador TF-IDF ao FoodLab com FastAPI

- calcular afinidade por conteúdo e aplicar filtros de categoria e orçamento
- ordenar resultados com prioridades explícitas e justificativas verificáveis
- integrar o formulário React aos estados reais da API
- adicionar testes, baseline sintético e documentação didática
- preparar execução local e arquivos para versionamento
```

Essa mensagem é uma sugestão para o futuro commit. Nenhum repositório remoto foi criado e nenhum upload foi executado nesta entrega.

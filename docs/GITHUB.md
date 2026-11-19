# Preparar o projeto para Git/GitHub

Use a pasta `foodlab` que contém README, backend, src e package.json como raiz do repositório. Não inclua a `.git` de uma pasta anterior nem diretórios de dependências no ZIP do código-fonte.

## Antes do primeiro commit

```powershell
npm.cmd run build
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m backend.evaluate
```

O `.gitignore` exclui node_modules, dist, .venv, caches Python, arquivos de cobertura, logs e variáveis de ambiente. `package-lock.json` e `backend/requirements-lock.txt` devem ser versionados. `docs/evaluation-results.json` é um relatório pequeno e reproduzível e pode ser versionado.

Os arquivos em `exploracao/` foram preservados. Eles são exercícios históricos; o aplicativo executa o código em backend/. Você pode mantê-los como registro de aprendizagem, deixando essa diferença clara.

## Criar o histórico local quando estivermos prontos

Na raiz de foodlab, primeiro confira se já existe um repositório com `git status`. Se não existir, inicialize. Se já existir, preserve o histórico.

```powershell
git init
git branch -M main
git add .
git status --short
git diff --cached --stat
```

Leia a lista antes de confirmar o commit. Ela deve conter código, dados fictícios, fotos locais, documentação e arquivos de configuração. Não deve conter .venv, node_modules ou dist.

Quando revisado:

```powershell
git commit -m "feat(foodmatch): integrar recomendador TF-IDF ao FoodLab com FastAPI"
```

## Publicação posterior

Crie o repositório no GitHub quando decidir o nome e a visibilidade. Use a URL real na configuração do remoto; não copie um endereço de exemplo como se fosse o seu. Se o repositório remoto já tiver commits, inspecione o histórico e faça a integração adequada antes de enviar. Não use push forçado como atalho.

O próximo passo conjunto será revisar arquivos e descrição, criar ou escolher o repositório remoto e fazer o primeiro push. Nenhuma dessas ações remotas foi executada nesta entrega.

## O que destacar no portfólio

- O problema de recomendação e por que conteúdo faz sentido sem histórico.
- Separação entre restrições e ranking.
- TF-IDF ajustado no catálogo, consultas transformadas no mesmo espaço e cosseno.
- API validada e fluxo integrado de estados no React.
- Avaliação sintética com baseline, destacando suas limitações.
- Uso transparente de assistência de IA e entendimento das decisões técnicas.

Não declare autoria manual exclusiva do código final nem qualidade de produção que não foi medida. As credenciais do projeto são sua compreensão, seus testes e sua capacidade de justificar e evoluir as escolhas.

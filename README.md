# Corporate Sales Platform API

> API REST para uma plataforma de vendas corporativas, construída com **Node.js**, **Express 5**, **TypeORM** e **PostgreSQL**, seguindo os princípios de **Domain-Driven Design (DDD)**.

A plataforma permite que empresas gerenciem seus produtos, colaboradores realizem vendas, e consumidores efetuem compras — tudo protegido por autenticação JWT com controle de acesso baseado em roles.

---

## Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Instalação e Configuração](#-instalação-e-configuração)
3. [Variáveis de Ambiente](#-variáveis-de-ambiente)
4. [Rodando com Docker (Recomendado)](#-rodando-com-docker-recomendado)
5. [Rodando Localmente (Sem Docker)](#-rodando-localmente-sem-docker)
6. [Documentação da API (Swagger)](#-documentação-da-api-swagger)
7. [Endpoints Resumo](#-endpoints-resumo)
8. [Autenticação e Autorização](#-autenticação-e-autorização)
9. [Scripts Disponíveis](#-scripts-disponíveis)
10. [Testes](#-testes)
11. [Estrutura do Projeto](#-estrutura-do-projeto)
12. [Tecnologias](#-tecnologias)
13. [Licença](#-licença)

---

## Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas na sua máquina:

| Ferramenta       | Versão mínima     | Como verificar            | Como instalar                              |
|-----------------|-------------------|---------------------------|--------------------------------------------|
| **Node.js**     | 20.x              | `node --version`          | [nodejs.org](https://nodejs.org/)          |
| **npm**         | 9.x               | `npm --version`           | Vem junto com o Node.js                    |
| **PostgreSQL**  | 16.x              | `psql --version`          | [postgresql.org](https://www.postgresql.org/download/) |
| **Docker**      | 24.x *(opcional)*  | `docker --version`        | [docker.com](https://docs.docker.com/get-docker/)    |
| **Docker Compose** | 2.x *(opcional)* | `docker compose version` | Vem junto com o Docker Desktop             |

> **Dica:** Se você usar Docker, **não precisa** ter o PostgreSQL instalado na máquina — o container já inclui o banco.

---

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/knex-corporate-sales-platform-api.git
cd knex-corporate-sales-platform-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores conforme necessário:

```bash
cp .env.example .env
```

> **Importante:** Nunca commite o arquivo `.env` no repositório. Ele já está no `.gitignore`.

---

## Variáveis de Ambiente

O arquivo `.env` na raiz do projeto controla toda a configuração. Abaixo está a explicação de cada variável:

```dotenv
# ┌─────────────────────────────────────────────┐
# │            BANCO DE DADOS                    │
# └─────────────────────────────────────────────┘
DB_USER=postgres                  # Usuário do PostgreSQL
DB_PASSWORD=postgres              # Senha do PostgreSQL
DB_NAME=corporate_sales_db        # Nome do banco de dados
DB_HOST=localhost                 # Host (use "db" se rodar via Docker)
DB_PORT=5432                      # Porta do PostgreSQL

# ┌─────────────────────────────────────────────┐
# │              SERVIDOR                        │
# └─────────────────────────────────────────────┘
PORT=3000                         # Porta em que a API vai rodar
NODE_ENV=development              # Ambiente: development | production

# ┌─────────────────────────────────────────────┐
# │           AUTENTICAÇÃO JWT                   │
# └─────────────────────────────────────────────┘
JWT_SECRET=troque_para_uma_chave_segura    # Chave secreta para assinar tokens
JWT_EXPIRATION=24h                         # Tempo de expiração do token (ex: 1h, 7d, 24h)
```

| Variável         | Obrigatória | Descrição                                                                 |
|------------------|:-----------:|---------------------------------------------------------------------------|
| `DB_USER`        | ✅          | Usuário de acesso ao PostgreSQL                                           |
| `DB_PASSWORD`    | ✅          | Senha do usuário PostgreSQL                                               |
| `DB_NAME`        | ✅          | Nome do banco. Será criado automaticamente no Docker                      |
| `DB_HOST`        | ✅          | `localhost` para execução local, `db` para Docker                         |
| `DB_PORT`        | ✅          | Porta do PostgreSQL (padrão: `5432`)                                      |
| `PORT`           | ❌          | Porta da API. Se não informada, usa `3000`                                |
| `NODE_ENV`       | ❌          | Define o ambiente. Afeta logs e comportamento                             |
| `JWT_SECRET`     | ✅          | **Troque em produção!** Chave usada para gerar/validar tokens JWT         |
| `JWT_EXPIRATION` | ❌          | Quanto tempo o token fica válido. Padrão: `24h`                           |

---

## Rodando com Docker (Recomendado)

A forma mais simples de rodar o projeto. O Docker sobe automaticamente o **PostgreSQL** e a **API** em containers isolados.

### Passo a passo

```bash
# 1. Certifique-se de ter o .env configurado (DB_HOST será ignorado, o Docker usa "db" internamente)
cp .env.example .env

# 2. Suba toda a stack (PostgreSQL + API)
npm run docker:up

# 3. Caso precise rebuildar (após mudanças no código)
npm run docker:rebuild

# 4. Acompanhe os logs em tempo real
npm run docker:logs
```

### Verificar se está funcionando

Após os containers subirem, teste o health check:

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{ "status": "ok", "timestamp": "2026-03-13T10:00:00.000Z" }
```

### Comandos Docker

| Comando                  | O que faz                                              |
|--------------------------|--------------------------------------------------------|
| `npm run docker:up`      | Sobe os containers em background (modo detached)       |
| `npm run docker:down`    | Para e remove todos os containers e networks           |
| `npm run docker:rebuild` | Reconstrói a imagem e sobe os containers novamente     |
| `npm run docker:logs`    | Exibe os logs da API em tempo real (Ctrl+C para sair)  |
| `npm run docker:migrate` | Executa as migrations dentro do container da API       |

### Parando o projeto

```bash
npm run docker:down
```

---

## Rodando Localmente (Sem Docker)

Se preferir rodar sem Docker, você precisará de um **PostgreSQL** rodando na sua máquina.

### Passo a passo completo

```bash
# 1. Instale as dependências (caso ainda não tenha feito)
npm install

# 2. Crie o banco de dados no PostgreSQL
psql -U postgres -c "CREATE DATABASE corporate_sales_db;"

# 3. Configure o .env (ajuste DB_HOST=localhost e a senha do seu PostgreSQL)
cp .env.example .env

# 4. Execute as migrations (cria as tabelas no banco)
npm run migration:run

# 5. Inicie o servidor em modo desenvolvimento (com hot-reload)
npm run dev
```

### Verificar se está funcionando

```bash
curl http://localhost:3000/health
# ou acesse no navegador: http://localhost:3000/health
```

> **Nota:** O servidor roda na porta definida em `PORT` no `.env`. Se `PORT` não estiver definido, a porta padrão é `3333`.

### Problemas comuns

| Problema | Solução |
|----------|---------|
| `ECONNREFUSED` ao conectar no banco | Verifique se o PostgreSQL está rodando e se `DB_HOST`, `DB_PORT`, `DB_USER` e `DB_PASSWORD` estão corretos no `.env` |
| Porta já em uso | Mude a variável `PORT` no `.env` para outra porta (ex: `3001`) |
| Erro nas migrations | Verifique se o banco `corporate_sales_db` existe. Crie com: `CREATE DATABASE corporate_sales_db;` |

---

## Documentação da API (Swagger)

O projeto inclui documentação interativa completa via **Swagger UI (OpenAPI 3.0)**. Nela você pode visualizar todos os endpoints, schemas, exemplos e **testar as rotas diretamente pelo navegador**.

### Como acessar

1. **Inicie o servidor** (via Docker ou localmente — veja as seções acima)

2. **Abra no navegador:**

   ```
   http://localhost:<PORTA>/api-docs
   ```

   Exemplos:
   - Se `PORT=3000` → **http://localhost:3000/api-docs**
   - Se `PORT=3333` → **http://localhost:3333/api-docs**
   - Se `PORT` não estiver no `.env` → **http://localhost:3333/api-docs**

3. **Pronto!** Você verá a interface interativa do Swagger com todos os endpoints documentados.

### Como testar endpoints autenticados no Swagger

Muitos endpoints exigem um token JWT. Siga estes passos para testar:

1. **Registre um usuário** — Expanda `POST /auth/register`, clique em **"Try it out"**, preencha o body e clique em **"Execute"**
2. **Copie o token** — Na resposta, copie o valor do campo `token`
3. **Autorize o Swagger** — Clique no botão **🔒 Authorize** (canto superior direito da página)
4. **Cole o token** — No campo que aparecer, cole o token JWT e clique em **"Authorize"**
5. **Teste as rotas** — Agora todas as rotas protegidas podem ser testadas diretamente no Swagger!

> **Dica:** O botão "Authorize" fica no topo da página do Swagger. Após autorizar, um ícone de cadeado fechado 🔒 aparecerá nos endpoints protegidos, indicando que o token está ativo.

### O que está documentado no Swagger

| Seção | Conteúdo |
|-------|----------|
| **Schemas** | Todos os formatos de request/response (RegisterRequest, LoginRequest, ProductResponse, etc.) |
| **Exemplos** | Cada endpoint tem exemplos realistas de como chamar e o que esperar de retorno |
| **Validações** | Os campos obrigatórios, tipos, limites mínimos/máximos estão documentados |
| **Erros** | Códigos de erro (400, 401, 403, 404, 409) com formato da resposta de erro |
| **Autenticação** | Endpoints protegidos marcados com ícone de cadeado 🔒 |

### Também pode acessar o JSON puro

Se precisar do spec OpenAPI em formato JSON (para importar no Postman, Insomnia, etc.):

```
http://localhost:<PORTA>/api-docs/swagger.json
```

> **Para importar no Postman:** Abra o Postman → Import → Link → cole a URL acima.

---

## Endpoints Resumo

Visão geral rápida de todas as rotas da API:

### Health

| Método | Rota       | Descrição         | Auth |
|--------|------------|-------------------|:----:|
| GET    | `/health`  | Health check      | ❌   |

### Auth

| Método | Rota             | Descrição                          | Auth |
|--------|------------------|------------------------------------|:----:|
| POST   | `/auth/register` | Registrar novo usuário             | ❌   |
| POST   | `/auth/login`    | Fazer login e obter token JWT      | ❌   |

### Companies

| Método | Rota              | Descrição               | Auth |
|--------|--------------------|------------------------|:----:|
| POST   | `/companies`       | Criar empresa          | ✅   |
| GET    | `/companies`       | Listar todas           | ✅   |
| GET    | `/companies/:id`   | Buscar por ID          | ✅   |
| PUT    | `/companies/:id`   | Atualizar              | ✅   |
| DELETE | `/companies/:id`   | Remover                | ✅   |

### Products

| Método | Rota             | Descrição                        | Auth | Role               |
|--------|------------------|----------------------------------|:----:|--------------------|
| POST   | `/products`      | Criar produto                    | ✅   | collaborator/admin |
| GET    | `/products`      | Listar (com busca e paginação)   | ✅   | —                  |
| GET    | `/products/:id`  | Buscar por ID                    | ✅   | —                  |
| PUT    | `/products/:id`  | Atualizar produto                | ✅   | collaborator + dono |
| DELETE | `/products/:id`  | Remover produto                  | ✅   | collaborator + dono |

### Transactions

| Método | Rota               | Descrição                          | Auth |
|--------|---------------------|------------------------------------|:----:|
| POST   | `/transactions`     | Realizar compra de produto         | ✅   |
| GET    | `/transactions/me`  | Listar minhas transações           | ✅   |
| GET    | `/transactions`     | Listar todas as transações         | ✅   |

### Users

| Método | Rota         | Descrição                      | Auth |
|--------|--------------|--------------------------------|:----:|
| GET    | `/users/me`  | Obter meu perfil               | ✅   |
| GET    | `/users`     | Listar todos os usuários       | ✅   |

> ✅ = Requer header `Authorization: Bearer <token>`

---

## Autenticação e Autorização

A API utiliza **JWT (JSON Web Token)** para proteger os endpoints.

### Como funciona

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Client  │ ──────────────────────────►│   API    │
│          │     { email, password }     │          │
│          │ ◄──────────────────────────│          │
│          │     { token: "eyJhb..." }  │          │
│          │                            │          │
│          │     GET /products          │          │
│          │     Authorization: Bearer  │          │
│          │ ──────────────────────────►│          │
│          │     eyJhb...               │          │
│          │ ◄──────────────────────────│          │
│          │     { data: [...] }        │          │
└──────────┘                            └──────────┘
```

### Enviando o token

Em **todas** as requisições para endpoints protegidos (marcados com ✅), envie o header:

```
Authorization: Bearer <seu_token_jwt>
```

Exemplo com cURL:

```bash
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Roles (Papéis de Usuário)

| Role            | Descrição                                                                      |
|-----------------|--------------------------------------------------------------------------------|
| `admin`         | Administrador — ao se registrar, pode gerenciar sua empresa e tudo dentro dela |
| `collaborator`  | Colaborador — vinculado a uma empresa existente, pode criar/editar produtos    |

### Registro por role

- **Admin:** Ao registrar com `role: "admin"`, o usuário é criado de forma independente.
- **Collaborator:** Ao registrar com `role: "collaborator"`, o campo `companyId` é **obrigatório** — o colaborador será vinculado à empresa informada.

---

## Scripts Disponíveis

Todos os scripts podem ser executados com `npm run <script>`:

### Desenvolvimento

| Script          | Comando                  | Descrição                                                            |
|-----------------|--------------------------|----------------------------------------------------------------------|
| `dev`           | `ts-node-dev ...`        | Inicia o servidor com hot-reload (reinicia automaticamente ao salvar) |
| `build`         | `tsc`                    | Compila todo o TypeScript para JavaScript na pasta `dist/`           |

### Banco de Dados

| Script               | Comando                      | Descrição                                                      |
|----------------------|------------------------------|----------------------------------------------------------------|
| `migration:run`      | `typeorm migration:run`      | Executa todas as migrations pendentes (cria/altera tabelas)    |
| `migration:revert`   | `typeorm migration:revert`   | Reverte a última migration executada                           |
| `migration:generate` | `typeorm migration:generate` | Gera uma nova migration baseada nas mudanças das entities      |
| `schema:sync`        | `typeorm schema:sync`        | Sincroniza o schema do banco com as entities (⚠️ use com cuidado em produção) |

### Docker

| Script           | Comando                      | Descrição                                              |
|------------------|------------------------------|--------------------------------------------------------|
| `docker:up`      | `docker-compose up -d`       | Sobe todos os containers em background                 |
| `docker:down`    | `docker-compose down`        | Para e remove os containers                            |
| `docker:rebuild` | `docker-compose up -d --build` | Reconstrói as imagens e sobe os containers           |
| `docker:logs`    | `docker-compose logs -f api` | Mostra os logs da API em tempo real                    |
| `docker:migrate` | `docker-compose exec api...` | Roda as migrations dentro do container                 |

### Qualidade de Código

| Script          | Comando              | Descrição                                           |
|-----------------|----------------------|-----------------------------------------------------|
| `lint`          | `eslint src`         | Verifica problemas de código com ESLint             |
| `lint:fix`      | `eslint src --fix`   | Corrige automaticamente os problemas de lint        |
| `test`          | `jest`               | Executa todos os testes                             |
| `test:watch`    | `jest --watch`       | Executa testes em modo watch (re-executa ao salvar) |
| `test:coverage` | `jest --coverage`    | Gera relatório de cobertura de testes               |

---

## Testes

O projeto usa **Jest** como framework de testes com **ts-jest** para suporte a TypeScript.

### Executando os testes

```bash
# Rodar todos os testes uma vez
npm test

# Rodar em modo watch (re-executa ao modificar arquivos)
npm run test:watch

# Gerar relatório de cobertura de código
npm run test:coverage
```

### Relatório de cobertura

Após rodar `npm run test:coverage`, o relatório é gerado em:

- **Terminal:** Resumo exibido diretamente no console
- **HTML:** Abra `coverage/lcov-report/index.html` no navegador para visualização detalhada
- **LCOV:** `coverage/lcov.info` para integração com ferramentas de CI/CD

```bash
# Abrir o relatório HTML no navegador (Linux)
xdg-open coverage/lcov-report/index.html
```

---

## Estrutura do Projeto

O projeto segue a arquitetura **DDD (Domain-Driven Design)**, onde cada módulo de domínio é isolado com suas próprias camadas:

```
src/
├── server.ts                          #    Entry point — configura Express, middlewares e rotas
│
├── modules/                           #    Módulos de domínio (cada um é independente)
│   │
│   ├── auth/                          #    Autenticação
│   │   ├── controllers/               #    Recebe requisições HTTP
│   │   │   └── AuthController.ts
│   │   ├── dtos/                      #    Data Transfer Objects (tipagem de entrada/saída)
│   │   │   ├── LoginDTO.ts
│   │   │   └── RegisterDTO.ts
│   │   ├── middlewares/               #    Middlewares de autenticação e autorização
│   │   │   ├── AuthMiddleware.ts      #    Verifica token JWT
│   │   │   ├── authorize.ts           #    Verifica permissões por role
│   │   │   ├── ensureCollaborator.ts  #    Garante que é collaborator
│   │   │   └── ensureCompanyOwnership.ts  # Garante propriedade do recurso
│   │   ├── routes/                    #    Definição das rotas Express
│   │   │   └── auth.routes.ts
│   │   ├── schemas/                   #    Validação com Yup
│   │   │   ├── loginSchema.ts
│   │   │   └── registerSchema.ts
│   │   └── services/                  #    Regras de negócio
│   │       ├── LoginService.ts
│   │       └── RegisterService.ts
│   │
│   ├── companies/                     #    Gestão de empresas
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── infra/typeorm/             #    Entities e Repositories do TypeORM
│   │   ├── repositories/             #    Interfaces de repositório (contrato)
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── products/                      #    Gestão de produtos
│   │   └── (mesma estrutura)
│   │
│   ├── transactions/                  #    Transações de compra
│   │   └── (mesma estrutura)
│   │
│   └── users/                         #    Gestão de usuários
│       └── (mesma estrutura)
│
└── shared/                            #    Código compartilhado entre módulos
    ├── errors/
    │   └── AppError.ts                #    Classe de erro customizada com statusCode
    ├── helpers/
    │   ├── logger.ts                  #    Logger padronizado
    │   ├── pagination.ts             #    Utilitários de paginação
    │   └── response.ts               #    Helper para respostas padronizadas
    ├── infra/
    │   ├── typeorm/                   #    Configuração do DataSource e migrations
    │   └── swagger/
    │       └── swagger.ts             #    Spec OpenAPI 3.0 (Swagger)
    ├── middlewares/
    │   ├── errorHandler.ts           #    Middleware global de tratamento de erros
    │   └── validate.ts               #    Middleware de validação com Yup
    └── types/
        └── index.ts                  #    Tipos utilitários compartilhados
```

### Fluxo de uma requisição

```
Request → Route → Middleware(s) → Controller → Service → Repository → Database
                                                   ↓
Response ← Controller ← Service (DTO de resposta) ←┘
```

---

## Tecnologias

| Tecnologia           | Versão  | Uso                                                    |
|---------------------|---------|--------------------------------------------------------|
| **Node.js**         | 20.x    | Runtime JavaScript no servidor                         |
| **Express**         | 5.x     | Framework HTTP para criação de rotas e middlewares      |
| **TypeScript**      | 5.x     | Superset tipado — segurança em tempo de compilação     |
| **TypeORM**         | 0.3.x   | ORM para mapeamento objeto-relacional com PostgreSQL   |
| **PostgreSQL**      | 16.x    | Banco de dados relacional robusto                      |
| **JWT**             | 9.x     | Autenticação stateless via tokens                      |
| **Yup**             | 1.x     | Validação declarativa de schemas de entrada            |
| **Swagger/OpenAPI** | 3.0     | Documentação interativa e testável da API              |
| **Jest**            | 30.x    | Framework de testes unitários e de integração          |
| **Docker**          | —       | Containerização para ambiente consistente              |
| **Helmet**          | 8.x     | Proteção de headers HTTP contra ataques comuns         |
| **CORS**            | 2.x     | Controle de acesso Cross-Origin                        |
| **bcryptjs**        | 3.x     | Hash seguro de senhas                                  |
| **dotenv**          | 17.x    | Carregamento de variáveis de ambiente do `.env`        |

---
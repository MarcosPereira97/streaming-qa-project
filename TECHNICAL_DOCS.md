# Documentação Técnica - Streaming Platform

## Arquitetura

### Estrutura de Pastas

```
streaming-platform/
├── backend/
│   ├── api-gateway/        # Gateway da API (porta 3000)
│   ├── services/
│   │   ├── user/          # Serviço de usuários (porta 3001)
│   │   └── content/       # Serviço de conteúdo (porta 3002)
│   └── database/          # Scripts SQL e seeds
├── frontend/              # Aplicação React (porta 80)
├── test/                  # Testes automatizados (sua pasta)
├── .env                   # Variáveis de ambiente
├── .dockerignore         # Arquivos ignorados pelo Docker
├── docker-compose.yml    # Orquestração dos containers
├── package.json          # Scripts principais
└── README.md            # Documentação geral
```

### Serviços

#### 1. PostgreSQL (porta 5432)

- Banco de dados principal
- Usuário: streaming_user
- Senha: streaming_pass
- Database: streaming_db

#### 2. Redis (porta 6379)

- Cache e gerenciamento de sessões
- Sem autenticação (desenvolvimento)

#### 3. API Gateway (porta 3000)

- Proxy reverso para os microserviços
- Autenticação JWT
- Rate limiting
- Documentação Swagger: http://localhost:3000/api-docs

#### 4. User Service (porta 3001)

- Registro e autenticação
- Gerenciamento de perfil
- Sessões e tokens

#### 5. Content Service (porta 3002)

- Gerenciamento de filmes e séries
- Favoritos
- Histórico de visualização
- Busca e recomendações

#### 6. Frontend (porta 80)

- React com Redux Toolkit
- Tailwind CSS
- React Router
- Axios para chamadas API

## Tecnologias Utilizadas

### Backend

- Node.js 18+
- Express.js
- PostgreSQL 16
- Redis 7
- JWT para autenticação
- Bcrypt para hash de senhas
- Joi para validação
- Winston para logs
- Knex.js como query builder

### Frontend

- React 18
- Redux Toolkit
- React Router 6
- Tailwind CSS 3
- Axios
- React Hook Form + Yup
- Framer Motion
- Swiper.js

### DevOps

- Docker & Docker Compose
- Health checks
- Graceful shutdown
- Rate limiting
- CORS configurado

## Fluxos Principais

### Autenticação

1. Registro: POST /api/auth/register
2. Login: POST /api/auth/login
3. Token JWT válido por 24h
4. Refresh token válido por 7 dias
5. Logout invalida o token

### Gerenciamento de Conteúdo

1. Listagem com paginação e filtros
2. Busca com sugestões
3. Favoritos por usuário
4. Histórico de visualização
5. Recomendações personalizadas

## Comandos Úteis

```bash
# Na raiz do projeto
npm run install:all     # Instala todas as dependências
npm run start          # Inicia todos os serviços
npm run stop           # Para todos os serviços
npm run logs           # Visualiza logs
npm run build          # Build dos containers

# Desenvolvimento
npm run dev:backend    # Inicia backend em modo dev
npm run dev:frontend   # Inicia frontend em modo dev
```

## Dados de Teste

### Usuário Demo

```json
{
  "email": "demo@example.com",
  "password": "Demo123!",
  "username": "demo"
}
```

### Conteúdo Inicial

- 3 filmes populares
- 3 séries populares
- Gêneros: Drama, Crime, Action, Thriller, Sci-Fi, Fantasy, Mystery

## Atributos para Automação

Todos os elementos importantes possuem `data-test` attributes:

- data-test="login-form"
- data-test="email-input"
- data-test="password-input"
- data-test="login-button"
- data-test="content-card-{id}"
- data-test="favorite-button"
- data-test="search-input"

## Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- JWT assinado com secret configurável
- Rate limiting em endpoints sensíveis
- Validação de entrada com Joi
- Sanitização de dados
- CORS configurado
- Headers de segurança com Helmet

## Performance

- Cache Redis para queries frequentes
- Lazy loading de imagens
- Paginação em todas as listagens
- Índices otimizados no banco
- Compressão gzip
- CDN ready para assets estáticos

## Monitoramento

- Health checks em todos os serviços
- Logs estruturados com Winston
- Graceful shutdown
- Métricas de rate limiting
- Tracking de erros

## Observações para Testes

1. Todos os serviços rodam localmente
2. Não há separação de ambientes
3. Dados são resetados ao reiniciar containers
4. Emails são capturados (não enviados)
5. Sem integração real com TMDB (mock data)

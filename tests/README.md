# Test Automation Suite

Esta pasta é dedicada exclusivamente para seus testes automatizados.

## Estrutura Sugerida

```
test/
├── e2e/              # Testes end-to-end
├── api/              # Testes de API
├── unit/             # Testes unitários
├── fixtures/         # Dados de teste
├── utils/            # Utilitários para testes
├── reports/          # Relatórios de testes
└── config/           # Configurações de teste
```

## Dados de Teste

### Usuário Demo

- Email: demo@example.com
- Password: Demo123!
- Username: demo

### Endpoints da API

- Base URL: http://localhost:3000/api
- Auth: /auth/login, /auth/register
- Content: /content/movies, /content/series
- Favorites: /favorites

### Seletores de Teste

O projeto já possui atributos `data-test` nos elementos importantes para facilitar a automação.

## Executando a Aplicação

Na raiz do projeto:

```bash
npm run start  # Inicia todos os serviços via Docker
npm run stop   # Para todos os serviços
npm run logs   # Visualiza logs dos serviços
```

## Observações

- Todos os serviços rodam localmente
- Não há separação de ambientes (tudo é desenvolvimento)
- As senhas e tokens estão configurados no arquivo .env
- O banco de dados é populado automaticamente com dados iniciais

# StreamFlix - Streaming Platform

A modern streaming platform built with microservices architecture, featuring movies and TV series browsing, user authentication, favorites management, and more.

## 🚀 Features

- **User Authentication**: Secure registration, login, and JWT-based authentication
- **Content Browsing**: Browse movies and TV series with filters and pagination
- **Search Functionality**: Real-time search with suggestions
- **Favorites Management**: Add/remove content to favorites list
- **Watch History**: Track viewing progress
- **Responsive Design**: Mobile-first responsive UI
- **API Documentation**: Swagger/OpenAPI documentation
- **Microservices Architecture**: Scalable and maintainable
- **Docker Support**: Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** for data storage
- **Redis** for caching and sessions
- **JWT** for authentication
- **Knex.js** for database queries
- **Docker** for containerization

### Frontend

- **React** with Redux Toolkit
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** with Yup validation
- **Framer Motion** for animations

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🔧 Installation

### Using Docker (Recommended)

1. Clone the repository:

```bash
git clone https://github.com/yourusername/streaming-platform.git
cd streaming-platform
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration

4. Start the services:

```bash
docker-compose up -d
```

The application will be available at:

- Frontend: http://localhost
- API Gateway: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

### Manual Installation

1. Install dependencies for each service:

```bash
# API Gateway
cd api-gateway && npm install

# User Service
cd ../services/user && npm install

# Content Service
cd ../content && npm install

# Frontend
cd ../../frontend && npm install
```

2. Set up PostgreSQL and Redis

3. Run database migrations:

```bash
cd services/user
npm run migrate
```

4. Start each service:

```bash
# In separate terminals
cd api-gateway && npm start
cd services/user && npm start
cd services/content && npm start
cd frontend && npm start
```

## 📁 Project Structure

```
streaming-platform/
├── api-gateway/          # API Gateway service
│   ├── src/
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # Route definitions
│   │   └── utils/        # Utility functions
│   └── Dockerfile
├── services/
│   ├── user/            # User authentication service
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── database/
│   │   └── Dockerfile
│   └── content/         # Content management service
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── routes/
│       │   └── database/
│       └── Dockerfile
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── services/
│   └── Dockerfile
├── database/
│   └── seed-data/      # Initial database seed
└── docker-compose.yml
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### Content

- `GET /api/content/movies` - Get movies list
- `GET /api/content/movies/:id` - Get movie details
- `GET /api/content/series` - Get series list
- `GET /api/content/series/:id` - Get series details
- `GET /api/content/trending` - Get trending content

### Favorites

- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Search

- `GET /api/search` - Search content
- `GET /api/search/suggestions` - Get search suggestions

## 🧪 Testing

The project includes test selectors (`data-test` attributes) for automated testing:

```javascript
// Example test selectors
data-test="login-form"
data-test="email-input"
data-test="password-input"
data-test="login-button"
```

Run tests:

```bash
# Unit tests
npm test

# E2E tests (configure your preferred framework)
npm run test:e2e
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

## 🚀 Deployment

### Production Build

1. Build frontend:

```bash
cd frontend && npm run build
```

2. Build Docker images:

```bash
docker-compose build
```

3. Deploy using Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Ensure all production environment variables are set:

- Strong JWT secret
- Production database credentials
- TMDB API key for content
- SMTP configuration for emails

## 📊 Performance Optimization

- Redis caching for frequently accessed data
- Database indexing for optimal queries
- Lazy loading for images
- Code splitting in React
- Compression middleware
- CDN for static assets

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Marcos Henrique - [@MarcosPereira97](https://github.com/MarcosPereira97)

## 🙏 Acknowledgments

- TMDB API for movie and TV show data
- React and Node.js communities
- All contributors and testers

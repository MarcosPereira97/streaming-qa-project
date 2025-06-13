# API Examples

This document contains example API calls for testing the StreamFlix platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "Password123!",
    "fullName": "New User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123!"
  }'
```

Response:

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "demo@example.com",
    "username": "demouser",
    "fullName": "Demo User"
  },
  "token": "jwt-token-here"
}
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Content

### Get Movies

```bash
# Get all movies
curl http://localhost:3000/api/content/movies

# With pagination and filters
curl "http://localhost:3000/api/content/movies?page=1&limit=20&genre=Action&year=2023&sortBy=popularity&order=desc"
```

### Get Movie by ID

```bash
curl http://localhost:3000/api/content/movies/MOVIE_ID
```

### Get Series

```bash
# Get all series
curl http://localhost:3000/api/content/series

# With filters
curl "http://localhost:3000/api/content/series?status=Returning Series&genre=Drama"
```

### Get Trending Content

```bash
# Get trending content
curl "http://localhost:3000/api/content/trending?type=all&timeWindow=week"
```

### Search Content

```bash
# Search for content
curl "http://localhost:3000/api/search?q=breaking&type=all&page=1"

# Get search suggestions
curl "http://localhost:3000/api/search/suggestions?q=break"
```

## Favorites (Requires Authentication)

### Get User Favorites

```bash
curl http://localhost:3000/api/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add to Favorites

```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "CONTENT_ID",
    "contentType": "movie"
  }'
```

### Remove from Favorites

```bash
curl -X DELETE http://localhost:3000/api/favorites/CONTENT_ID?contentType=movie \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check if Content is Favorited

```bash
curl http://localhost:3000/api/favorites/check/CONTENT_ID?contentType=movie \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Profile (Requires Authentication)

### Get Current User

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "fullName": "Updated Name"
  }'
```

### Change Password

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }'
```

## Watch History (Requires Authentication)

### Update Watch Progress

```bash
curl -X POST http://localhost:3000/api/content/watch-history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "CONTENT_ID",
    "contentType": "movie",
    "progress": 3600,
    "totalDuration": 7200
  }'
```

### Get Watch History

```bash
curl http://localhost:3000/api/content/watch-history?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Continue Watching

```bash
curl http://localhost:3000/api/content/continue-watching \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Advanced Search

```bash
curl -X POST http://localhost:3000/api/search/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "query": "action",
    "type": "movie",
    "genres": ["Action", "Adventure"],
    "yearFrom": 2020,
    "yearTo": 2023,
    "ratingMin": 7.0,
    "sortBy": "popularity"
  }'
```

## Testing with HTTPie

If you prefer HTTPie, here are equivalent examples:

```bash
# Login
http POST localhost:3000/api/auth/login \
  email=demo@example.com \
  password=Demo123!

# Get movies with auth
http GET localhost:3000/api/content/movies \
  "Authorization: Bearer YOUR_JWT_TOKEN"

# Add to favorites
http POST localhost:3000/api/favorites \
  "Authorization: Bearer YOUR_JWT_TOKEN" \
  contentId=CONTENT_ID \
  contentType=movie
```

## WebSocket Events (Future Feature)

```javascript
// Connect to WebSocket
const ws = new WebSocket("ws://localhost:3000");

// Subscribe to notifications
ws.send(
  JSON.stringify({
    type: "subscribe",
    channel: "notifications",
    token: "YOUR_JWT_TOKEN",
  })
);

// Listen for events
ws.on("message", (data) => {
  const event = JSON.parse(data);
  console.log("Received event:", event);
});
```

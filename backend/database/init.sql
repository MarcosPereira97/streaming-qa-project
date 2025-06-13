-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    overview TEXT,
    poster_path VARCHAR(500),
    backdrop_path VARCHAR(500),
    release_date DATE,
    runtime INTEGER,
    imdb_rating DECIMAL(3,1),
    tmdb_rating DECIMAL(3,1),
    popularity DECIMAL(10,2),
    genres JSONB,
    production_companies JSONB,
    cast_members JSONB,
    director VARCHAR(255),
    language VARCHAR(10),
    budget BIGINT,
    revenue BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create series table
CREATE TABLE IF NOT EXISTS series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    overview TEXT,
    poster_path VARCHAR(500),
    backdrop_path VARCHAR(500),
    first_air_date DATE,
    last_air_date DATE,
    number_of_seasons INTEGER,
    number_of_episodes INTEGER,
    episode_runtime INTEGER[],
    imdb_rating DECIMAL(3,1),
    tmdb_rating DECIMAL(3,1),
    popularity DECIMAL(10,2),
    genres JSONB,
    networks JSONB,
    cast_members JSONB,
    creators JSONB,
    status VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('movie', 'series')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id, content_type)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('movie', 'series')),
    progress INTEGER DEFAULT 0,
    total_duration INTEGER,
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_movies_imdb_rating ON movies(imdb_rating DESC);

CREATE INDEX IF NOT EXISTS idx_series_tmdb_id ON series(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_series_title ON series(title);
CREATE INDEX IF NOT EXISTS idx_series_first_air_date ON series(first_air_date DESC);
CREATE INDEX IF NOT EXISTS idx_series_popularity ON series(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_series_imdb_rating ON series(imdb_rating DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_content ON favorites(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content ON watch_history(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched ON watch_history(last_watched_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_series_updated_at ON series;
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_watch_history_updated_at ON watch_history;
CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON watch_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo user (password: Demo123!)
INSERT INTO users (email, username, password_hash, full_name, email_verified) VALUES
('demo@example.com', 'demo', '$2a$10$YKxGqvL8PY8YgUCtTr.yN.2cGxBhqEt6X4cA.Kn1QWHdGHPBGyALe', 'Demo User', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample movies
INSERT INTO movies (title, original_title, overview, poster_path, backdrop_path, release_date, runtime, imdb_rating, tmdb_rating, popularity, genres) VALUES
('The Shawshank Redemption', 'The Shawshank Redemption', 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.', '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', '1994-09-23', 142, 9.3, 8.7, 83.631, '[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}]'),
('The Godfather', 'The Godfather', 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.', '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', '1972-03-24', 175, 9.2, 8.7, 120.737, '[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}]'),
('The Dark Knight', 'The Dark Knight', 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations.', '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg', '2008-07-16', 152, 9.0, 8.5, 122.917, '[{"id": 18, "name": "Drama"}, {"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}, {"id": 53, "name": "Thriller"}]')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Insert sample series
INSERT INTO series (title, original_title, overview, poster_path, backdrop_path, first_air_date, number_of_seasons, number_of_episodes, imdb_rating, tmdb_rating, popularity, genres, status) VALUES
('Breaking Bad', 'Breaking Bad', 'When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live.', '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', '2008-01-20', 5, 62, 9.5, 8.9, 490.672, '[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}]', 'Ended'),
('Game of Thrones', 'Game of Thrones', 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.', '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', '/suopoADq0k8YZr4dQXcU6pToj6s.jpg', '2011-04-17', 8, 73, 9.3, 8.4, 532.418, '[{"id": 10765, "name": "Sci-Fi & Fantasy"}, {"id": 18, "name": "Drama"}, {"id": 10759, "name": "Action & Adventure"}]', 'Ended'),
('Stranger Things', 'Stranger Things', 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.', '/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', '/rcA17r3hfHtRrk3Xs3hXrgGeSGT.jpg', '2016-07-15', 4, 42, 8.7, 8.6, 441.123, '[{"id": 18, "name": "Drama"}, {"id": 10765, "name": "Sci-Fi & Fantasy"}, {"id": 9648, "name": "Mystery"}]', 'Returning Series')
ON CONFLICT (tmdb_id) DO NOTHING;
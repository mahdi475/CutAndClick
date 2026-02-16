CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'customer',
    location TEXT NOT NULL,
    profile_pic_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE haircut_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    price FLOAT NOT NULL,
    time_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE item_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    price FLOAT NOT NULL,
    status TEXT DEFAULT 'in_stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES users(id) NOT NULL,
    haircut_id INTEGER REFERENCES haircut_posts(id) NOT NULL,
    booking_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opening_hours (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    monday TEXT,
    tuesday TEXT,
    wednesday TEXT,
    thursday TEXT,
    friday TEXT,
    saturday TEXT,
    sunday TEXT
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    target_user_id UUID REFERENCES users(id) NOT NULL,
    stars INTEGER,
    review_title TEXT,
    review_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
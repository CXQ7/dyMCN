-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'customer')),
    last_login_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 直播间表
CREATE TABLE IF NOT EXISTS live_rooms (
    id SERIAL PRIMARY KEY,
    platform_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('preparing', 'living', 'ended')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 文档表
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    live_room_id INTEGER NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('word', 'excel', 'pdf', 'text')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Q&A表
CREATE TABLE IF NOT EXISTS qa_pairs (
    id SERIAL PRIMARY KEY,
    live_room_id INTEGER NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source VARCHAR(255) CHECK (source IN ('manual', 'auto_generated', 'document', 'asr')),
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    live_room_id INTEGER NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    platform_id VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(100) NOT NULL,
    interaction_count INTEGER DEFAULT 1,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 问题表
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    live_room_id INTEGER NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'ignored')),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 对话记录表
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    responder_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    live_room_id INTEGER NOT NULL REFERENCES live_rooms(id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    product_count INTEGER NOT NULL,
    order_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_response_related BOOLEAN DEFAULT FALSE,
    related_question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    related_response_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_live_rooms_platform_id ON live_rooms(platform_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_live_room ON documents(live_room_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_priority ON questions(priority);
CREATE INDEX IF NOT EXISTS idx_questions_live_room ON questions(live_room_id);
CREATE INDEX IF NOT EXISTS idx_conversations_question ON conversations(question_id);
CREATE INDEX IF NOT EXISTS idx_conversations_responder ON conversations(responder_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_live_room ON orders(live_room_id);
CREATE INDEX IF NOT EXISTS idx_orders_response_related ON orders(is_response_related);

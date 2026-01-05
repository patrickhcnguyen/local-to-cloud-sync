CREATE TABLE IF NOT EXISTS notes {
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    -- content is temporary, because our initial building phase still needs a persistence model
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
}
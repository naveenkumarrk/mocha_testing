


CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- auto-increment ID
    title TEXT NOT NULL,                    -- task title
    description TEXT,                       -- optional task details
    completed BOOLEAN NOT NULL DEFAULT 0,   -- status (0 = false, 1 = true)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



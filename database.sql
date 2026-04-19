-- Schema for TaviClean Database

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    photo TEXT,
    contact TEXT,
    email TEXT,
    address TEXT,
    district TEXT,
    municipality TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT,
    customerName TEXT NOT NULL,
    customerPhoto TEXT,
    serviceType TEXT,
    address TEXT,
    city TEXT,
    status TEXT,
    price REAL,
    checklist TEXT, -- Stored as JSON string
    contact TEXT,
    email TEXT,
    typology TEXT,
    isSpecial TEXT,
    comment TEXT
);

CREATE TABLE IF NOT EXISTS team (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    photo TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    time TEXT,
    unread INTEGER DEFAULT 1 -- 1 for true, 0 for false
);

CREATE TABLE IF NOT EXISTS earnings (
    id TEXT PRIMARY KEY,
    date TEXT,
    amount REAL,
    method TEXT,
    status TEXT
);

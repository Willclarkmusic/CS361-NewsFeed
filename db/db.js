import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "newsdb.db"));

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT UNIQUE NOT NULL,
        url_hash TEXT NOT NULL,
        title TEXT NOT NULL,
        source TEXT NOT NULL,
        platform TEXT,
        author TEXT,
        published_date TEXT,
        scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        full_content TEXT,
        image_url TEXT,
        UNIQUE(url_hash)
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS article_categories (
        article_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (article_id, category_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scrape_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        articles_found INTEGER DEFAULT 0,
        articles_added INTEGER DEFAULT 0,
        status TEXT DEFAULT 'running',
        error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
    CREATE INDEX IF NOT EXISTS idx_articles_platform ON articles(platform);
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_date);
    CREATE INDEX IF NOT EXISTS idx_articles_url_hash ON articles(url_hash);
    CREATE INDEX IF NOT EXISTS idx_scrape_logs_source ON scrape_logs(source);
`);

export default db;

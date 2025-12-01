import db from "../db/db.js";

// Insert a new article (returns true if inserted, false if duplicate)
export function insertArticle(article) {
    const existing = db.prepare(
        "SELECT id FROM articles WHERE url_hash = ?"
    ).get(article.url_hash);

    if (existing) return false;

    const stmt = db.prepare(`
        INSERT INTO articles
        (url, url_hash, title, source, platform, author, published_date, summary, full_content, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        article.url,
        article.url_hash,
        article.title,
        article.source,
        article.platform || null,
        article.author || null,
        article.published_date || null,
        article.summary || null,
        article.full_content || null,
        article.image_url || null
    );

    // Insert categories if present
    if (result.lastInsertRowid && article.categories?.length) {
        insertCategories(result.lastInsertRowid, article.categories);
    }

    return result.changes > 0;
}

// Insert categories for an article
export function insertCategories(articleId, categories) {
    const insertCategory = db.prepare(
        "INSERT OR IGNORE INTO categories (name) VALUES (?)"
    );
    const getCategory = db.prepare(
        "SELECT id FROM categories WHERE name = ?"
    );
    const linkCategory = db.prepare(
        "INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)"
    );

    for (const category of categories) {
        if (typeof category === "string" && category.trim()) {
            insertCategory.run(category.trim());
            const cat = getCategory.get(category.trim());
            if (cat) {
                linkCategory.run(articleId, cat.id);
            }
        }
    }
}

// Get all articles with pagination (list view fields only)
export function getAllArticles(limit = 50, offset = 0) {
    return db.prepare(`
        SELECT id, title, author, published_date, url, image_url, platform, summary
        FROM articles
        ORDER BY published_date DESC
        LIMIT ? OFFSET ?
    `).all(limit, offset);
}

// Get total article count for pagination
export function getArticleCount() {
    return db.prepare("SELECT COUNT(*) as count FROM articles").get();
}

// Get articles by source with pagination
export function getArticlesBySource(source, limit = 50, offset = 0) {
    return db.prepare(`
        SELECT id, title, author, published_date, url, image_url, platform, summary
        FROM articles
        WHERE source = ?
        ORDER BY published_date DESC
        LIMIT ? OFFSET ?
    `).all(source, limit, offset);
}

// Get article count by source for pagination
export function getArticleCountBySource(source) {
    return db.prepare("SELECT COUNT(*) as count FROM articles WHERE source = ?").get(source);
}

// Get single article by ID
export function getArticleById(id) {
    return db.prepare("SELECT * FROM articles WHERE id = ?").get(id);
}

// Get categories for an article
export function getArticleCategories(articleId) {
    return db.prepare(`
        SELECT c.name FROM categories c
        JOIN article_categories ac ON c.id = ac.category_id
        WHERE ac.article_id = ?
    `).all(articleId).map(row => row.name);
}

// Search articles by title or summary
export function searchArticles(query, limit = 50) {
    const searchTerm = `%${query}%`;
    return db.prepare(`
        SELECT id, title, author, published_date, url, image_url, platform, summary
        FROM articles
        WHERE title LIKE ? OR summary LIKE ?
        ORDER BY published_date DESC
        LIMIT ?
    `).all(searchTerm, searchTerm, limit);
}

// Get article counts grouped by source
export function getSourceStats() {
    return db.prepare(`
        SELECT source, COUNT(*) as count
        FROM articles
        GROUP BY source
        ORDER BY count DESC
    `).all();
}

// Get all unique sources
export function getSources() {
    return db.prepare(`
        SELECT DISTINCT source FROM articles ORDER BY source
    `).all().map(row => row.source);
}

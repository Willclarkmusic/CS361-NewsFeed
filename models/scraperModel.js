import db from "../db/db.js";

// Start a new scrape log entry
export function startScrapeLog(source) {
    const stmt = db.prepare(`
        INSERT INTO scrape_logs (source, started_at, status)
        VALUES (?, datetime('now'), 'running')
    `);
    const result = stmt.run(source);
    return result.lastInsertRowid;
}

// Complete a scrape log entry
export function completeScrapeLog(logId, articlesFound, articlesAdded, status, errorMessage = null) {
    const stmt = db.prepare(`
        UPDATE scrape_logs
        SET completed_at = datetime('now'),
            articles_found = ?,
            articles_added = ?,
            status = ?,
            error_message = ?
        WHERE id = ?
    `);
    stmt.run(articlesFound, articlesAdded, status, errorMessage, logId);
}

// Get recent scrape logs
export function getRecentLogs(limit = 50) {
    return db.prepare(`
        SELECT * FROM scrape_logs
        ORDER BY started_at DESC
        LIMIT ?
    `).all(limit);
}

// Get logs for a specific source
export function getLogsBySource(source, limit = 20) {
    return db.prepare(`
        SELECT * FROM scrape_logs
        WHERE source = ?
        ORDER BY started_at DESC
        LIMIT ?
    `).all(source, limit);
}

// Get the last successful scrape for each source
export function getLastSuccessfulScrapes() {
    return db.prepare(`
        SELECT source, MAX(completed_at) as last_scrape, articles_added
        FROM scrape_logs
        WHERE status = 'success'
        GROUP BY source
    `).all();
}

// Get scrape statistics
export function getScrapeStats() {
    const total = db.prepare("SELECT COUNT(*) as count FROM scrape_logs").get();
    const successful = db.prepare("SELECT COUNT(*) as count FROM scrape_logs WHERE status = 'success'").get();
    const failed = db.prepare("SELECT COUNT(*) as count FROM scrape_logs WHERE status = 'error'").get();

    return {
        total: total.count,
        successful: successful.count,
        failed: failed.count
    };
}

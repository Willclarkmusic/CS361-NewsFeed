import * as ArticleModel from "../models/articleModel.js";

// GET /news/ - Health check / server status
export function serverStatus(req, res) {
    // TODO: Implement health check
    // Return { status: "ok", service: "News Feed Service" }
    res.json({ status: "ok", service: "News Feed Service" });
}

// GET /news/articles - Get all articles with pagination
export function getArticles(req, res) {
    // TODO: Implement pagination
    // Query params: ?limit=50&offset=0
    // Use ArticleModel.getAllArticles(limit, offset)
    // Return { success: true, data: [...], pagination: { limit, offset, total } }
}

// GET /news/articles/:id - Get single article by ID
export function getArticleById(req, res) {
    // TODO: Implement single article fetch
    // Use ArticleModel.getArticleById(req.params.id)
    // Include categories via ArticleModel.getArticleCategories(id)
    // Return 404 if not found
}

// GET /news/articles/source/:source - Get articles filtered by source
export function getArticlesBySource(req, res) {
    // TODO: Implement source filtering
    // Use ArticleModel.getArticlesBySource(req.params.source, limit)
    // Query param: ?limit=50
}

// GET /news/search?q=query - Search articles
export function searchArticles(req, res) {
    // TODO: Implement search
    // Query params: ?q=search_term&limit=50
    // Use ArticleModel.searchArticles(query, limit)
    // Return 400 if no query provided
}

// GET /news/stats - Get article statistics
export function getStats(req, res) {
    // TODO: Implement stats endpoint
    // Use ArticleModel.getArticleCount() and ArticleModel.getSourceStats()
    // Return { success: true, total: X, bySource: [...] }
}

// GET /news/sources - Get list of sources with articles
export function getSources(req, res) {
    // TODO: Implement sources list
    // Use ArticleModel.getSources()
}

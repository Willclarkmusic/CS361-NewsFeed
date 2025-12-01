import * as ArticleModel from "../models/articleModel.js";

// GET /news/ - Health check
export function serverStatus(req, res) {
    res.json({ status: "ok", service: "News Feed Service" });
}

// GET /news/stats - Get article statistics
export function getStats(req, res) {
    const total = ArticleModel.getArticleCount();
    const bySource = ArticleModel.getSourceStats();

    res.json({
        success: true,
        total: total.count,
        bySource
    });
}

// GET /news/sources - Get list of sources
export function getSources(req, res) {
    const sources = ArticleModel.getSources();

    res.json({
        success: true,
        sources
    });
}

// GET /news/articles - Get all articles with pagination
export function getArticles(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const articles = ArticleModel.getAllArticles(limit, offset);
    const total = ArticleModel.getArticleCount();

    res.json({
        success: true,
        data: articles,
        pagination: {
            limit,
            offset,
            total: total.count
        }
    });
}

// GET /news/articles/:id - Get single article by ID
export function getArticleById(req, res) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid article ID"
        });
    }

    const article = ArticleModel.getArticleById(id);

    if (!article) {
        return res.status(404).json({
            success: false,
            message: "Article not found"
        });
    }

    const categories = ArticleModel.getArticleCategories(id);

    res.json({
        success: true,
        data: {
            ...article,
            categories
        }
    });
}

// GET /news/articles/source/:source - Get articles filtered by source
export function getArticlesBySource(req, res) {
    const { source } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const articles = ArticleModel.getArticlesBySource(source, limit, offset);
    const total = ArticleModel.getArticleCountBySource(source);

    res.json({
        success: true,
        data: articles,
        pagination: {
            limit,
            offset,
            total: total.count
        }
    });
}

// GET /news/search?q=query - Search articles
export function searchArticles(req, res) {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 50;

    if (!query || query.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Search query parameter 'q' is required"
        });
    }

    const articles = ArticleModel.searchArticles(query.trim(), limit);

    res.json({
        success: true,
        data: articles,
        query: query.trim(),
        count: articles.length
    });
}

import express from "express";
import {
    serverStatus,
    getArticles,
    getArticleById,
    getArticlesBySource,
    searchArticles,
    getStats,
    getSources
} from "../controllers/articleController.js";

const router = express.Router();

// GET /news/ - Health check
router.get("/", serverStatus);

// GET /news/articles - Get all articles (paginated)
// TODO: Implement handler - Query params: ?limit=50&offset=0
router.get("/articles", getArticles);

// GET /news/stats - Get statistics (must be before :id route)
// TODO: Implement handler
router.get("/stats", getStats);

// GET /news/sources - Get list of sources
// TODO: Implement handler
router.get("/sources", getSources);

// GET /news/search - Search articles
// TODO: Implement handler - Query params: ?q=query&limit=50
router.get("/search", searchArticles);

// GET /news/articles/source/:source - Get articles by source
// TODO: Implement handler
router.get("/articles/source/:source", getArticlesBySource);

// GET /news/articles/:id - Get single article
// TODO: Implement handler
router.get("/articles/:id", getArticleById);

export default router;

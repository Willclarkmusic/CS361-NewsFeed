import express from "express";
import {
    serverStatus,
    getStats,
    getSources,
    getArticles,
    getArticleById,
    getArticlesBySource,
    searchArticles
} from "../controllers/articleController.js";

const router = express.Router();

// GET /news/ - Health check
router.get("/", serverStatus);

// GET /news/stats - Get article statistics
router.get("/stats", getStats);

// GET /news/sources - Get list of sources
router.get("/sources", getSources);

// GET /news/articles - Get all articles (paginated)
router.get("/articles", getArticles);

// GET /news/search - Search articles
router.get("/search", searchArticles);

// GET /news/articles/source/:source - Get articles by source
router.get("/articles/source/:source", getArticlesBySource);

// GET /news/articles/:id - Get single article
router.get("/articles/:id", getArticleById);

export default router;

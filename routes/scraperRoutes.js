import express from "express";
import {
    triggerScrape,
    triggerSourceScrape,
    getScrapeStatus,
    getScrapeLogs,
    getScraperSources
} from "../controllers/scraperController.js";

const router = express.Router();

// POST /scraper/trigger - Trigger full scrape (all sources)
router.post("/trigger", triggerScrape);

// POST /scraper/trigger/:source - Trigger scrape for specific source
router.post("/trigger/:source", triggerSourceScrape);

// GET /scraper/status - Get scheduler status
router.get("/status", getScrapeStatus);

// GET /scraper/logs - Get recent scrape logs
router.get("/logs", getScrapeLogs);

// GET /scraper/sources - Get available sources
router.get("/sources", getScraperSources);

export default router;

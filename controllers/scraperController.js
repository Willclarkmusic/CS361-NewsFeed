import { scrapeAllSources, scrapeSourceByName, getAvailableSources } from "../services/scraperService.js";
import { getSchedulerStatus, isScraping, setRunningState, setLastRun } from "../services/schedulerService.js";
import * as ScraperModel from "../models/scraperModel.js";

// POST /scraper/trigger - Trigger full scrape of all sources
export async function triggerScrape(req, res) {
    if (isScraping()) {
        return res.status(409).json({
            success: false,
            message: "A scrape is already in progress"
        });
    }

    setRunningState(true);

    try {
        console.log("Manual scrape triggered via API");
        const results = await scrapeAllSources();

        setLastRun({
            timestamp: new Date().toISOString(),
            status: "success",
            results: results,
            triggeredBy: "manual"
        });

        res.json({
            success: true,
            message: "Scrape completed",
            results: results
        });
    } catch (error) {
        setLastRun({
            timestamp: new Date().toISOString(),
            status: "error",
            error: error.message,
            triggeredBy: "manual"
        });

        res.status(500).json({
            success: false,
            message: "Scrape failed",
            error: error.message
        });
    } finally {
        setRunningState(false);
    }
}

// POST /scraper/trigger/:source - Trigger scrape for a specific source
export async function triggerSourceScrape(req, res) {
    const { source } = req.params;

    if (isScraping()) {
        return res.status(409).json({
            success: false,
            message: "A scrape is already in progress"
        });
    }

    setRunningState(true);

    try {
        console.log(`Manual scrape triggered for source: ${source}`);
        const result = await scrapeSourceByName(source);

        res.json({
            success: true,
            message: `Scrape completed for ${source}`,
            result: result
        });
    } catch (error) {
        res.status(error.message.includes("Unknown source") ? 400 : 500).json({
            success: false,
            message: "Scrape failed",
            error: error.message
        });
    } finally {
        setRunningState(false);
    }
}

// GET /scraper/status - Get scheduler and scraper status
export function getScrapeStatus(req, res) {
    const schedulerStatus = getSchedulerStatus();
    const availableSources = getAvailableSources();

    res.json({
        success: true,
        scheduler: schedulerStatus,
        sources: availableSources
    });
}

// GET /scraper/logs - Get recent scrape logs
export function getScrapeLogs(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const source = req.query.source;

    let logs;
    if (source) {
        logs = ScraperModel.getLogsBySource(source, limit);
    } else {
        logs = ScraperModel.getRecentLogs(limit);
    }

    const stats = ScraperModel.getScrapeStats();

    res.json({
        success: true,
        stats: stats,
        logs: logs
    });
}

// GET /scraper/sources - Get list of available sources
export function getScraperSources(req, res) {
    const sources = getAvailableSources();

    res.json({
        success: true,
        sources: sources
    });
}

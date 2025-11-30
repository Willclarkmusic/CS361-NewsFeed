import cron from "node-cron";
import { scrapeAllSources } from "./scraperService.js";

let scheduledTask = null;
let isRunning = false;
let lastRun = null;

// Start the scheduler (runs daily at 6 AM)
export function startScheduler() {
    if (scheduledTask) {
        console.log("Scheduler already running");
        return;
    }

    // Cron: minute 0, hour 6, every day
    scheduledTask = cron.schedule("0 6 * * *", async () => {
        if (isRunning) {
            console.log("Scrape already in progress, skipping scheduled run");
            return;
        }

        console.log("Starting scheduled daily scrape...");
        isRunning = true;

        try {
            const results = await scrapeAllSources();
            lastRun = {
                timestamp: new Date().toISOString(),
                status: "success",
                results: results
            };
            console.log("Scheduled scrape completed successfully");
        } catch (error) {
            lastRun = {
                timestamp: new Date().toISOString(),
                status: "error",
                error: error.message
            };
            console.error("Scheduled scrape failed:", error.message);
        } finally {
            isRunning = false;
        }
    });

    console.log("Scraper scheduled for daily execution at 6:00 AM");
}

// Stop the scheduler
export function stopScheduler() {
    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
        console.log("Scheduler stopped");
    }
}

// Get scheduler status
export function getSchedulerStatus() {
    return {
        scheduled: scheduledTask !== null,
        isRunning: isRunning,
        schedule: "0 6 * * * (Daily at 6:00 AM)",
        lastRun: lastRun
    };
}

// Check if scraper is currently running
export function isScraping() {
    return isRunning;
}

// Set running state (used by manual triggers)
export function setRunningState(running) {
    isRunning = running;
}

// Update last run info
export function setLastRun(runInfo) {
    lastRun = runInfo;
}

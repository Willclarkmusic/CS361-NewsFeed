import { RssScraper } from "../scrapers/rssScraper.js";
import { sources } from "../scrapers/sources/index.js";
import * as ArticleModel from "../models/articleModel.js";
import * as ScraperModel from "../models/scraperModel.js";

const DELAY_BETWEEN_SOURCES_MS = 3000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Scrape all configured sources
export async function scrapeAllSources() {
    const results = [];
    console.log(`Starting scrape of ${sources.length} sources...`);

    for (let i = 0; i < sources.length; i++) {
        const config = sources[i];

        try {
            const result = await scrapeSource(config);
            results.push(result);
            console.log(`[${i + 1}/${sources.length}] ${config.name}: Found ${result.found}, Added ${result.added}`);
        } catch (error) {
            console.error(`[${i + 1}/${sources.length}] ${config.name}: ERROR - ${error.message}`);
            results.push({
                source: config.name,
                status: "error",
                found: 0,
                added: 0,
                error: error.message
            });
        }

        // Delay between sources (except for last one)
        if (i < sources.length - 1) {
            await sleep(DELAY_BETWEEN_SOURCES_MS);
        }
    }

    console.log("Scrape completed for all sources");
    return results;
}

// Scrape a single source
export async function scrapeSource(config) {
    const logId = ScraperModel.startScrapeLog(config.name);

    try {
        const scraper = new RssScraper(config);
        const articles = await scraper.scrape();

        let added = 0;
        for (const article of articles) {
            try {
                const wasAdded = ArticleModel.insertArticle(article);
                if (wasAdded) added++;
            } catch (insertError) {
                console.error(`Error inserting article from ${config.name}:`, insertError.message);
            }
        }

        ScraperModel.completeScrapeLog(logId, articles.length, added, "success");

        return {
            source: config.name,
            status: "success",
            found: articles.length,
            added: added
        };
    } catch (error) {
        ScraperModel.completeScrapeLog(logId, 0, 0, "error", error.message);
        throw error;
    }
}

// Scrape a specific source by name
export async function scrapeSourceByName(sourceName) {
    const config = sources.find(s =>
        s.name.toLowerCase() === sourceName.toLowerCase()
    );

    if (!config) {
        throw new Error(`Unknown source: ${sourceName}. Available: ${sources.map(s => s.name).join(", ")}`);
    }

    return await scrapeSource(config);
}

// Get list of available sources
export function getAvailableSources() {
    return sources.map(s => ({
        name: s.name,
        feedUrl: s.feedUrl,
        platform: s.platform
    }));
}

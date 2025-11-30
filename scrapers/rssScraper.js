import Parser from "rss-parser";
import axios from "axios";
import { createHash } from "crypto";

const parser = new Parser({
    customFields: {
        item: [
            ["media:content", "mediaContent", { keepArray: true }],
            ["media:thumbnail", "mediaThumbnail"],
            ["dc:creator", "dcCreator"],
            ["category", "categories", { keepArray: true }],
            ["content:encoded", "contentEncoded"]
        ]
    },
    timeout: 30000
});

export class RssScraper {
    constructor(config) {
        this.name = config.name;
        this.feedUrl = config.feedUrl;
        this.platform = config.platform || config.name;
        this.userAgent = "NewsScraperBot/1.0 (Educational Project)";
    }

    generateUrlHash(url) {
        return createHash("md5").update(url).digest("hex");
    }

    async fetchFeed() {
        try {
            const response = await axios.get(this.feedUrl, {
                headers: {
                    "User-Agent": this.userAgent,
                    "Accept": "application/rss+xml, application/xml, text/xml"
                },
                timeout: 30000
            });
            return await parser.parseString(response.data);
        } catch (error) {
            // Fallback: try direct parsing with rss-parser
            return await parser.parseURL(this.feedUrl);
        }
    }

    parseItem(item) {
        return {
            url: item.link,
            url_hash: this.generateUrlHash(item.link),
            title: this.cleanText(item.title),
            source: this.name,
            platform: this.platform,
            author: item.creator || item.dcCreator || item.author || null,
            published_date: this.parseDate(item.pubDate || item.isoDate),
            summary: this.cleanText(item.contentSnippet || item.description || item.summary),
            full_content: this.cleanText(item.contentEncoded || item.content),
            image_url: this.extractImageUrl(item),
            categories: this.extractCategories(item)
        };
    }

    cleanText(text) {
        if (!text) return null;
        // Remove HTML tags and decode entities
        return text
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    }

    parseDate(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return date.toISOString();
        } catch {
            return dateString;
        }
    }

    extractImageUrl(item) {
        // Try various common RSS image locations
        if (item.mediaContent && item.mediaContent.length > 0) {
            const media = item.mediaContent[0];
            if (media.$ && media.$.url) return media.$.url;
            if (typeof media === "string") return media;
        }
        if (item.mediaThumbnail) {
            if (item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
                return item.mediaThumbnail.$.url;
            }
        }
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        // Try to extract from content
        if (item.content || item.contentEncoded) {
            const content = item.contentEncoded || item.content;
            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) return imgMatch[1];
        }
        return null;
    }

    extractCategories(item) {
        const categories = [];
        if (item.categories) {
            for (const cat of item.categories) {
                if (typeof cat === "string") {
                    categories.push(cat);
                } else if (cat._ || cat.$?.term) {
                    categories.push(cat._ || cat.$.term);
                }
            }
        }
        return categories;
    }

    async scrape() {
        const feed = await this.fetchFeed();
        const articles = [];

        for (const item of feed.items) {
            try {
                const article = this.parseItem(item);
                if (article.url && article.title) {
                    articles.push(article);
                }
            } catch (error) {
                console.error(`Error parsing item from ${this.name}:`, error.message);
            }
        }

        return articles;
    }
}

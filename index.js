import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/db.js";
import articleRouter from "./routes/articleRoutes.js";
import scraperRouter from "./routes/scraperRoutes.js";
import { startScheduler } from "./services/schedulerService.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8000", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Routes
app.use("/news", articleRouter);
app.use("/scraper", scraperRouter);

// Root health check
app.get("/", (req, res) => {
    res.json({ status: "ok", service: "News Feed Service" });
});

// Start scheduler for daily scraping
startScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`News Feed service running on port ${PORT}`);
});

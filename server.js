const express = require("express");
const fs = require("fs");
const app = express();
const ytstream = require("yt-stream");
const path = require("path");
const port = 3000;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // ytstream.setApiKey("AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA");
  // ytstream.setPreference("api", "ANDROID");
  // ytstream.setPreference("scrape");

  const agent = new ytstream.YTStreamAgent(
    JSON.parse(fs.readFileSync("cookies.json"))
  );
  ytstream.setGlobalAgent(agent);

  try {
    const stream = await ytstream.stream(videoUrl, {
      download: true,
      quality: "high",
      type: "audio",
    });

    res.setHeader("Content-Type", "audio/mpeg");
    stream.stream.pipe(res);
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

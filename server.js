const express = require("express");
const fs = require("fs");
const app = express();
const ytdl = require("@distube/ytdl-core");
const path = require("path");
const port = 3000;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const agentOptions = {
  pipelining: 5,
  maxRedirections: 0,
};

const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookies.json")));

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    ytdl(videoUrl, {
      agent,
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
      filter: "audioonly",
    }).pipe(res);

    res.setHeader("Content-Type", "audio/mpeg");
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const express = require("express");
const fs = require("fs");
const app = express();
const ytdl = require("@distube/ytdl-core");
const path = require("path");
const port = 3000;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { default: axios } = require("axios");
const https = require("https");
const Bottleneck = require("bottleneck"); // For rate limiting

puppeteer.use(StealthPlugin());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Bottleneck limiter for YouTube and Lyrics API to prevent rate-limiting
const limiter = new Bottleneck({
  minTime: 500, // Limit to 2 requests per second
  maxConcurrent: 5, // Maximum concurrent API calls
});

const agentOptions = {
  pipelining: 5,
  maxRedirections: 0,
  localAddress: "127.0.0.1",
};

const agent = ytdl.createAgent(
  JSON.parse(fs.readFileSync("cookies.json"), agentOptions)
);

// Stream audio from YouTube
app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Throttle the ytdl-core request to prevent being rate-limited
    limiter
      .schedule(() =>
        ytdl(videoUrl, {
          agent,
          requestOptions: {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Encoding": "gzip, deflate, sdch",
              "Accept-Language": "en-US,en;q=0.8",
              "Upgrade-Insecure-Requests": "1",
              "Cache-Control": "max-age=0",
              "x-youtube-client-name": "1",
              "x-youtube-client-version": "2.20200202.00.00",
              Connection: "keep-alive",
              Referer: "https://www.google.com/",
              Host: "www.youtube.com",
            },
          },
          filter: "audioonly",
        })
      )
      .then((stream) => {
        res.setHeader("Content-Type", "audio/mpeg");
        stream.pipe(res);
      });
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

// Fetch lyrics using a third-party API with rate-limiting
app.get("/lyrics", async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).send("Missing title");
  }

  // Step 1: Remove everything in parentheses
  let cleanedTitleString = title.replace(/\s*\(.*?\)/, "").trim();

  // Step 2: Remove commas
  let cleanedStringTitle = cleanedTitleString.replace(/,/g, "").trim();

  try {
    // Use the limiter to rate-limit lyrics API requests
    const response = await limiter.schedule(() =>
      axios.get(
        `https://api.textyl.co/api/lyrics?q=${encodeURIComponent(
          cleanedStringTitle
        )}`,
        {
          httpsAgent,
        }
      )
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 - lyrics not found
      return res.status(404).send("Lyrics not found");
    } else {
      console.error("Error fetching lyrics:", error);
      res.status(500).send("Error fetching lyrics");
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

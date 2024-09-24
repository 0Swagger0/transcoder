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
puppeteer.use(StealthPlugin());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const agentOptions = {
  pipelining: 5,
  maxRedirections: 0,
  localAddress: "127.0.0.1",
};

const agent = ytdl.createAgent(
  JSON.parse(fs.readFileSync("cookies.json"), agentOptions)
);

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  try {
    ytdl(videoUrl, {
      agent,
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
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

// get lyrics
app.get("/lyrics", async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).send("Missing artist or title");
  }

  try {
    const response = await axios.get(
      `https://api.textyl.co/api/lyrics?q=${title}`,
      {
        httpsAgent,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching lyrics:", error);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

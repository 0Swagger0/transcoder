import express from "express";
import axios from "axios";
import https from "https";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

// express app initialization
const app = express();
const port = 3000;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const agentOptions = {
    pipelining: 5,
    maxRedirections: 0,
  };

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const agent = ytdl.createAgent(
      JSON.parse(fs.readFileSync("./cookies.json", "utf8")),
      agentOptions
    );

    // Stream audio from YouTube
    ytdl(videoUrl, {
      agent,
      filter: "audioonly",
    }).pipe(res);

    res.setHeader("Content-Type", "audio/mpeg");
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
  let cleanedStringTitle = cleanedTitleString.replace(/[,&|]/g, "").trim();

  try {
    axios.get(
      `https://api.textyl.co/api/lyrics?q=${encodeURIComponent(
        cleanedStringTitle
      )}`,
      {
        httpsAgent,
      }
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

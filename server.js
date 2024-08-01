const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const puppeteer = require("puppeteer");
const app = express();
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  // agent should be created once if you don't want to change your cookie
  const agentOptions = {
    pipelining: 5,
    maxRedirections: 0,
    localAddress: "10.244.38.65",
  };
  const agent = ytdl.createAgent(
    JSON.parse(fs.readFileSync("cookies.json")),
    agentOptions
  );

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    ytdl(videoUrl, {
      agent,
      filter: "audioonly",
      quality: "highestaudio",
    }).pipe(res);
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

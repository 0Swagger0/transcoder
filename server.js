const express = require("express");
const fs = require("fs");
const app = express();
const ytstream = require("yt-stream");
const path = require("path");
const port = 3000;

ytstream.setApiKey(`AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA`);
ytstream.setPreference("api", "ANDROID");
ytstream.setPreference("scrape");

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const agent = new ytstream.YTStreamAgent([], {
    localAddress: "10.244.53.138",
    keepAlive: true,
    keepAliveMsecs: 5e3,
  });

  agent.syncFile(path.join(__dirname, `./cookies.json`));

  try {
    const stream = await ytstream.stream(videoUrl, {
      download: true,
      quality: "high",
      highWaterMark: 1048576 * 32,
      type: "audio",
    });
    stream.stream.pipe(res);

    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

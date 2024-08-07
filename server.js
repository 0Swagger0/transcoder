const express = require("express");
const fs = require("fs");
const app = express();
const ytstream = require("yt-stream");
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  ytstream.setApiKey("AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA");
  ytstream.setPreference("api", "ANDROID");
  ytstream.setPreference("scrape");

  ytstream.setGlobalAgent(JSON.parse(fs.readFileSync("cookies.json")));

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

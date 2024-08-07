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

  ytstream.userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0";

  try {
    try {
      const stream = await ytstream.stream(videoUrl, {
        download: true,
        quality: "high",
        highWaterMark: 1048576 * 32,
        type: "audio",
      });
      stream.stream.pipe(res);
    } catch (error) {
      console.error("Error fetching audio stream:", error);
      res.status(500).send("Error fetching audio stream");
    }
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

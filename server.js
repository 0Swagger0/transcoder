// server.js
const express = require("express");
const ytstream = require("yt-stream");
const app = express();
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const stream = await ytstream.stream(videoUrl, {
      quality: "high",
      type: "audio",
      highWaterMark: 1048576 * 32,
      download: true,
    });

    stream.stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

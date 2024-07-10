const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

app.get("/stream", (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (!ytdl.validateURL(videoUrl)) {
    return res.status(400).send("Invalid YouTube video ID");
  }

  try {
    const audioStream = ytdl(videoUrl, { quality: "highestaudio" });

    res.setHeader("Content-Type", "audio/mpeg");
    audioStream.pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).send("Failed to stream audio");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

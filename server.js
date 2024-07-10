const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const stream = ytdl(videoUrl, { quality: "highestaudio" });

    res.setHeader("Content-Type", "audio/mpeg");
    stream.pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).send("Failed to stream audio");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

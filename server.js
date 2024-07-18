const express = require("express");
const { google } = require("googleapis");
const ytstream = require("yt-stream");
const app = express();
const port = 3000;

const youtube = google.youtube({
  version: "v3",
  auth: "AIzaSyBpctfB4xmAQOJ903s-Me4ehga4PnDu6pc", // Replace with your YouTube API key
});

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  try {
    const response = await youtube.videos.list({
      part: "snippet",
      id: videoId,
    });

    if (response.data.items.length === 0) {
      return res.status(404).send("Video not found");
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const stream = await ytstream.stream(videoUrl, {
      quality: "high",
      type: "audio",
      highWaterMark: 1048576 * 32,
      download: true,
    });

    stream.stream.pipe(res);
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

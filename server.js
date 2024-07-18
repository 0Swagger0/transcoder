const express = require("express");
const ytstream = require("yt-stream");
const app = express();
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    console.error("Missing YouTube video ID");
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`Fetching stream for URL: ${videoUrl}`);

  try {
    // Log and validate the video URL
    if (!videoUrl.startsWith("https://www.youtube.com/watch?v=")) {
      console.error("Invalid YouTube URL format");
      return res.status(400).send("Invalid YouTube URL format");
    }

    const stream = await ytstream.stream(videoUrl, {
      quality: "high",
      type: "audio",
      highWaterMark: 1048576 * 32, // 32MB buffer
      download: true,
    });

    // Log success and pipe the stream
    console.log(`Streaming audio for video ID: ${videoId}`);
    stream.stream.pipe(res);
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

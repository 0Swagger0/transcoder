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
  ytstream.setApiKey("AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA");
  ytstream.setPreference("api", "ANDROID");
  ytstream.setGlobalHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.youtube.com/",
    DNT: "1", // Do Not Track
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    TE: "Trailers",
  });

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
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

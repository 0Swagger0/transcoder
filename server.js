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

  ytstream.setApiKey(`AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA`);
  ytstream.setPreference("api", "ANDROID");
  ytstream.setPreference("scrape");

  const agent = new ytstream.YTStreamAgent(
    [
      {
        key: "SOCS",
        value: "CAI",
        domain: "youtube.com",
        expires: "Infinity",
        sameSite: "lax",
        httpOnly: false,
        hostOnly: false,
        secure: true,
        path: "/",
      },
    ],
    {
      localAddress: "127.0.0.1",
      keepAlive: true,
      keepAliveMsecs: 5e3,
    }
  );

  ytstream.setGlobalAgent(agent);

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

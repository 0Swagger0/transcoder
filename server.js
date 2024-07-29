const express = require("express");
const ytstream = require("yt-stream");
const app = express();
const port = 3000;

// initiate yt stream
ytstream.setApiKey(`AIzaSyBpctfB4xmAQOJ903s-Me4ehga4PnDu6pc`); // Only sets the api key
ytstream.setPreference("api", "WEB"); // Tells the package to use the api and use a web client for requests
ytstream.setPreference("scrape");

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  ytstream.setGlobalHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.youtube.com/",
    Origin: "https://www.youtube.com",
    Connection: "keep-alive",
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1",

    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  });

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // Base user agent string with a placeholder for the Gecko date
  const baseUserAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/[DATE] Firefox/94.0";

  try {
    const stream = await ytstream.stream(videoUrl, {
      download: true,
      type: "audio",
      quality: "high",
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

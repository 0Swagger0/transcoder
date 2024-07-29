const express = require("express");
const ytstream = require("yt-stream");
const app = express();
const port = 3000;

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
    keepAlive: true,
    keepAliveMsecs: 5e3,
  }
);

ytstream.setGlobalAgent(agent);

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // Base user agent string with a placeholder for the Gecko date

  res.writeHead(200, {
    "Content-Type": "audio/mpeg", // Set appropriate content type
    "Content-Disposition": "inline",
  });

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
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

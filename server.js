const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
require("dotenv").config();
const app = express();
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // Base user agent string with a placeholder for the Gecko date
  const agent = ytdl.createAgent([
    {
      domain: ".youtube.com",
      expirationDate: 1234567890,
      hostOnly: false,
      httpOnly: true,
      name: "AFmmF2swRAIgekjc3IZ5exa1gea6Uf5SXIpqwVssJpDYsv72Vzvpm_kCIEMSzuNSHSG0PPxlTsRnuwAgOKhy_On-GhXIGjD2lXQH:QUQ3MjNmekdoNGlmSXhhQ3R2WmxwaW0yLUMxcFo2Yl8xUGlqc2t6OS01SExVQTZxdXJGVklOZjdsNDYtNXl1VEV5MlRNRjZpZnlYTXJ6X0dyeXNVTDhibWdRRmRYWm9CWjhZdk5aV2lrTlZjZ0xFOHhwU2pPY041QlUzTzdIdlZ0VGFWSDBtSVlFdmhmendJVExkWnBxQTZpdW9ZcnNqWUFB",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      value: "L9iA9XDqN65MaLtO/A6W9-HS5k3fy1gNoT",
    },
  ]);

  try {
    ytdl(videoUrl, {
      agent,
      filter: "audioonly",
      quality: "highestaudio",
    }).pipe(res);
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

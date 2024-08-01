const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

// Function to update cookie expiration dates
const updateCookiesExpiration = (cookies, futureDate) => {
  return cookies.map((cookie) => {
    cookie.expirationDate = futureDate;
    return cookie;
  });
};

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  // const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookies.json")));

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Read cookies from file and update expiration date
    const cookiesPath = path.join(__dirname, "cookies.json");
    let cookies = JSON.parse(fs.readFileSync(cookiesPath, "utf8"));

    // Set a far future date for expiration, e.g., 10 years from now
    const futureDate = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60;
    cookies = updateCookiesExpiration(cookies, futureDate);

    // Create an agent with updated cookies
    const agent = ytdl.createAgent(cookies);

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

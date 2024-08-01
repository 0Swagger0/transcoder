const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const puppeteer = require("puppeteer");
const app = express();
const path = require("path");
const port = 3000;

const COOKIES_PATH = path.resolve(__dirname, "cookies.json");

// Function to update cookies using Puppeteer
async function updateCookies() {
  let existingCookies = [];

  if (fs.existsSync(COOKIES_PATH)) {
    const cookiesData = fs.readFileSync(COOKIES_PATH);
    existingCookies = JSON.parse(cookiesData);
  }

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("https://www.youtube.com");

  const newCookies = await page.cookies();

  const updatedCookies = existingCookies.map((cookie, index) => {
    const newCookie = newCookies.find(
      (c) => c.name === cookie.name && c.domain === cookie.domain
    );
    return {
      ...cookie,
      expirationDate: newCookie
        ? newCookie.expires
        : Date.now() / 1000 + 30 * 24 * 60 * 60,
      id: index + 1,
    };
  });

  fs.writeFileSync(COOKIES_PATH, JSON.stringify(updatedCookies, null, 2));

  await browser.close();

  return updatedCookies;
}

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }
  await updateCookies();

  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
  const agent = ytdl.createAgent(cookies);

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    res.setHeader("Content-Type", "audio/mpeg");

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

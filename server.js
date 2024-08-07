const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const app = express();
const path = require("path");
const ytstream = require("yt-stream");
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
    executablePath: "/usr/bin/chromium-browser",
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

  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
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
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

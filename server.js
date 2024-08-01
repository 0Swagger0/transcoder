const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const puppeteer = require("puppeteer");
const app = express();
const port = 3000;

const COOKIE_PATH = "cookies.json";

// Function to generate cookies using Puppeteer
async function refreshCookies() {
  // Launch Puppeteer with specified Chrome path or default
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode
    executablePath: "/path/to/chrome", // Optional: Specify Chrome path if needed
  });
  const page = await browser.newPage();
  await page.goto("https://www.youtube.com"); // Visit YouTube to get cookies
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies));
  await browser.close();
}

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }
  // const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookies.json")));
  // Refresh cookies if they don't exist or are outdated
  if (!fs.existsSync(COOKIE_PATH)) {
    await refreshCookies();
  }

  const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, "utf8"));
  const agent = ytdl.createAgent(cookies); // Create an agent with cookies

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

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

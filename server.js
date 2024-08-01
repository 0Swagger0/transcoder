const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const puppeteer = require("puppeteer");
const app = express();
const port = 3000;

// Function to refresh cookies using Puppeteer
async function refreshCookies() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to YouTube and log in (requires automation logic for login)
  await page.goto("https://www.youtube.com");

  // Add logic to automate the login process

  // Wait for login to complete and cookies to be set
  await page.waitForNavigation();

  // Get cookies and write them to a file
  const cookies = await page.cookies();
  fs.writeFileSync("cookies.json", JSON.stringify(cookies));
  console.log(cookies);

  await browser.close();
}

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  // const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookies.json")));

  const cookies = JSON.parse(fs.readFileSync("cookies.json"));
  const agent = ytdl.createAgent(cookies);
  console.log(cookies);

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
  refreshCookies().catch(console.error);
});

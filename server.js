const express = require("express");
const fs = require("fs");
const app = express();
const ytdl = require("@distube/ytdl-core");
const path = require("path");
const port = 3000;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { default: axios } = require("axios");
const https = require("https");
const Bottleneck = require("bottleneck"); // For rate limiting

puppeteer.use(StealthPlugin());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Bottleneck limiter for YouTube and Lyrics API to prevent rate-limiting
const limiter = new Bottleneck({
  minTime: 500, // Limit to 2 requests per second
  maxConcurrent: 5, // Maximum concurrent API calls
});

const agentOptions = {
  pipelining: 5,
  maxRedirections: 0,
  localAddress: "127.0.0.1",
};

const agent = ytdl.createAgent(
  JSON.parse(fs.readFileSync("cookies.json"), agentOptions)
);

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false, // Set to true for headless mode
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();

//   // Set user-agent (optional)
//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
//   );

//   // Navigate to Google login page
//   await page.goto("https://accounts.google.com/", {
//     waitUntil: "networkidle2",
//   });

//   // Input your Google account email
//   await page.type('input[type="email"]', "meenaarjun229@gmail.com", {
//     delay: 100,
//   });
//   await page.click("#identifierNext");
//   await page.waitForTimeout(2000); // Wait for the transition

//   // Input your Google account password
//   await page.type('input[type="password"]', "9537155202", { delay: 100 });
//   await page.click("#passwordNext");

//   // Wait for the login to complete and YouTube to load
//   await page.waitForNavigation({ waitUntil: "networkidle2" });

//   // Redirect to YouTube
//   await page.goto("https://www.youtube.com", { waitUntil: "networkidle2" });

//   // Optional: Wait for a specific element that indicates login is complete
//   // You can adjust this selector based on your needs
//   await page.waitForSelector("#avatar-btn", { timeout: 60000 }); // Wait for avatar button (logged-in state)

//   // Get all cookies
//   const cookies = await page.cookies();

//   // Filter cookies related to YouTube
//   const youtubeCookies = cookies.filter((cookie) =>
//     cookie.domain.includes(".youtube.com")
//   );

//   console.log(youtubeCookies);

//   // Close browser
//   await browser.close();
// })();
// Stream audio from YouTube
app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Throttle the ytdl-core request to prevent being rate-limited
    limiter
      .schedule(() =>
        ytdl(videoUrl, {
          agent,
          filter: "audioonly",
        })
      )
      .then((stream) => {
        res.setHeader("Content-Type", "audio/mpeg");
        stream.pipe(res);
      });
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

// Fetch lyrics using a third-party API with rate-limiting
app.get("/lyrics", async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).send("Missing title");
  }

  // Step 1: Remove everything in parentheses
  let cleanedTitleString = title.replace(/\s*\(.*?\)/, "").trim();

  // Step 2: Remove commas
  let cleanedStringTitle = cleanedTitleString.replace(/,/g, "").trim();

  try {
    // Use the limiter to rate-limit lyrics API requests
    const response = await limiter.schedule(() =>
      axios.get(
        `https://api.textyl.co/api/lyrics?q=${encodeURIComponent(
          cleanedStringTitle
        )}`,
        {
          httpsAgent,
        }
      )
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle 404 - lyrics not found
      return res.status(404).send("Lyrics not found");
    } else {
      console.error("Error fetching lyrics:", error);
      res.status(500).send("Error fetching lyrics");
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

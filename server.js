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
const { exec } = require("child_process");

puppeteer.use(StealthPlugin());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to false for debugging purposes
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const loginUrl =
    "https://accounts.google.com/signin/v2/identifier?service=youtube";
  const username = "meenaarjun229@gmail.com";
  const password = "9537155202";

  try {
    await page.goto(loginUrl, { waitUntil: "networkidle2" });

    // Log in to YouTube
    await page.type('input[type="email"]', username);
    await page.click("#identifierNext");

    // Wait for password input to appear, with increased timeout
    await page.waitForSelector('input[type="password"]', {
      visible: true,
      timeout: 60000,
    });
    await page.type('input[type="password"]', password);
    await page.click("#passwordNext");

    // Wait for navigation to complete
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Handle potential additional steps (consent pages, security checks)
    // Example: If there's a consent button
    try {
      await page.waitForSelector('button[jsname="LgbsSe"]', {
        visible: true,
        timeout: 10000,
      });
      await page.click('button[jsname="LgbsSe"]');
      await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 60000,
      });
    } catch (err) {
      console.log("No consent button found, continuing...");
    }
    const cookies = await page.cookies();

    // Reformat the cookies into the desired format
    const formattedCookies = cookies.map((cookie, index) => ({
      domain: cookie.domain,
      expirationDate: cookie.expires || null, // If expiration date exists
      hostOnly: cookie.hostOnly || false,
      httpOnly: cookie.httpOnly || false,
      name: cookie.name,
      path: cookie.path || "/",
      sameSite: cookie.sameSite || "unspecified",
      secure: cookie.secure || false,
      session: cookie.session || false,
      storeId: "0",
      value: cookie.value,
      id: index + 1, // Generating an ID for each cookie
    }));

    // Save the formatted cookies to a JSON file
    // const cookiesPath = "cookies.json";
    // fs.writeFileSync(cookiesPath, JSON.stringify(formattedCookies, null, 2));
    console.log("Formatted Cookies saved:", formattedCookies);

    await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }
})();

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

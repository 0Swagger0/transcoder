const express = require("express");
const fs = require("fs");
const app = express();
const ytstream = require("yt-stream");
const path = require("path");
const port = 3000;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-accelerated-2d-canvas",
//       "--no-first-run",
//       "--no-zygote",
//       "--disable-gpu",
//       "--window-size=1920x1080",
//       '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"',
//     ],
//   });

//   const page = await browser.newPage();
//   await page.setViewport({ width: 1920, height: 1080 });
//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
//   );

//   const loginUrl =
//     "https://accounts.google.com/signin/v2/identifier?service=youtube";
//   const username = "meenaarjun229@gmail.com";
//   const password = "9537155202";

//   try {
//     await page.goto(loginUrl, { waitUntil: "networkidle2" });

//     // Log in to YouTube
//     await page.type('input[type="email"]', username);
//     await page.click("#identifierNext");

//     // Wait for password input to appear, with increased timeout
//     await page.waitForSelector('input[type="password"]', {
//       visible: true,
//       timeout: 60000,
//     });
//     await page.type('input[type="password"]', password);
//     await page.click("#passwordNext");

//     // Wait for navigation to complete
//     await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

//     // Handle potential additional steps (consent pages, security checks)
//     // Example: If there's a consent button
//     try {
//       await page.waitForSelector('button[jsname="LgbsSe"]', {
//         visible: true,
//         timeout: 10000,
//       });
//       await page.click('button[jsname="LgbsSe"]');
//       await page.waitForNavigation({
//         waitUntil: "networkidle2",
//         timeout: 60000,
//       });
//     } catch (err) {
//       console.log("No consent button found, continuing...");
//     }

//     // Go to YouTube homepage
//     await page.goto("https://www.youtube.com/", { waitUntil: "networkidle2" });

//     // Save cookies to a file in the required format
//     const cookies = await page.cookies();

//     // Format cookies to match the desired structure
//     const formattedCookies = cookies.map((cookie, index) => ({
//       domain: cookie.domain,
//       expirationDate: cookie.expires !== -1 ? cookie.expires : undefined,
//       hostOnly: cookie.hostOnly,
//       httpOnly: cookie.httpOnly,
//       name: cookie.name,
//       path: cookie.path,
//       sameSite: cookie.sameSite || "unspecified",
//       secure: cookie.secure,
//       session: cookie.session,
//       storeId: "0",
//       value: cookie.value,
//       id: index + 1,
//     }));

//     // Save formatted cookies as JSON
//     console.log(formattedCookies);
//     console.log("Cookies saved successfully.");
//   } catch (error) {
//     console.error("An error occurred:", error);
//   } finally {
//     await browser.close();
//   }
// })();

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  ytstream.setApiKey("AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA");
  ytstream.setPreference("api", "ANDROID");
  ytstream.setPreference("scrape");

  const agent = new ytstream.YTStreamAgent(
    JSON.parse(fs.readFileSync("cookies.json"))
  );
  ytstream.setGlobalAgent(agent);

  try {
    const stream = await ytstream.stream(videoUrl, {
      download: true,
      quality: "high",
      type: "audio",
    });

    res.setHeader("Content-Type", "audio/mpeg");
    stream.stream.pipe(res);
  } catch (error) {
    console.error("Error fetching audio stream:", error);
    res.status(500).send("Error fetching audio stream");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

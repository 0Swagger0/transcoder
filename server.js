import express from "express";
import axios from "axios";
import https from "https";
import { YtdlCore } from "@ybd-project/ytdl-core";
import { generate } from "youtube-po-token-generator";
import fs from "fs";

// express app initialization
const app = express();
const port = 3000;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  // Read the cookies from cookies.json file
  const cookies = JSON.parse(fs.readFileSync("cookies.json"));

  // Convert cookies into a single string (key=value pairs)
  const cookieString = cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const { poToken, visitorData } = await generate();

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Stream audio from YouTube
    const ytdl = new YtdlCore({
      poToken: poToken,
      visitorData: visitorData,
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": "2.20210208.00.01",
          Cookie: cookieString,
        },
      },
    });
    ytdl.download(videoUrl, { filter: "audioonly" }).pipe(res);

    res.setHeader("Content-Type", "audio/mpeg");
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

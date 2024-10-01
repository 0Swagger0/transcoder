import express from "express";
import axios from "axios";
import https from "https";
import { YtdlCore } from "@ybd-project/ytdl-core";

// express app initialization
const app = express();
const port = 3000;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Stream audio from YouTube
    const ytdl = new YtdlCore({
      poToken:
        "MnT9xC-4aKOc7P38KQ90xJJX8kJCwHWu-f3DkxdGk1KC2M1wwjC2W1iREo4m8jH4cOM9rKkQ7cFXaposx3r90t4AHH7-XHSzS0BXFzbX5kCcsTufb_fBSPdIJyMNzi5e---MF6dov5z1ZVRn2GOs9H5feD_bbA==",
      visitorData: "CgtuVVFCV09vcUIwQSic3-63BjIKCgJJThIEGgAgZA%3D%3D'",
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

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

  const NORMAL_OAUTH2 = new YtdlCore.OAuth2({
    accessToken:
      "ya29.a0AcM612z9KTKj19spI4J6vt8s8dHIuTJ4eiCUuv94xOe581MvP8r6kwjBR5mUdvBKhA7tjl6sTv1LGMeg8UidnAI850hiEc-jQodWG55RjDnR7rxCUyV0O-aWypOMTV3kJPYoqbrRNal5bXYtgYUH8rZ7cn4j-edzzOlyi1BDaCgYKAbkSARISFQHGX2MiOaNdGx5-kjLZ_Z75A5FqZg0175",
    tokenType: "Bearer",
    scope:
      "https://www.googleapis.com/auth/youtube.force-ssl; https://www.googleapis.com/auth/youtube;",

    clientData: {
      clientId:
        "270148540245-l6cc0qv5q00u8r03h9g6e9sh2s84j8jg.apps.googleusercontent.com",
      clientSecret: "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",
    },
  });

  const { poToken, visitorData } = await generate();

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Stream audio from YouTube
    const ytdl = new YtdlCore({
      oauth2: NORMAL_OAUTH2,
      poToken: poToken,
      visitorData: visitorData,
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

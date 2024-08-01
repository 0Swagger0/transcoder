const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
require("dotenv").config();
const app = express();
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    ytdl(videoUrl, {
      requestOptions: {
        headers: {
          Cookeis:
            "LOGIN_INFO=AFmmF2swRAIgekjc3IZ5exa1gea6Uf5SXIpqwVssJpDYsv72Vzvpm_kCIEMSzuNSHSG0PPxlTsRnuwAgOKhy_On-GhXIGjD2lXQH:QUQ3MjNmekdoNGlmSXhhQ3R2WmxwaW0yLUMxcFo2Yl8xUGlqc2t6OS01SExVQTZxdXJGVklOZjdsNDYtNXl1VEV5MlRNRjZpZnlYTXJ6X0dyeXNVTDhibWdRRmRYWm9CWjhZdk5aV2lrTlZjZ0xFOHhwU2pPY041QlUzTzdIdlZ0VGFWSDBtSVlFdmhmendJVExkWnBxQTZpdW9ZcnNqWUFB; HSID=A3R66C9aGqUlhobaJ; SSID=A0Wxtv7gOITl5TGNN; APISID=L9iA9XDqN65MaLtO/A6W9-HS5k3fy1gNoT; SAPISID=37NGJc_KytJTmfTl/AXUGlaM6aChFojCbS; __Secure-1PAPISID=37NGJc_KytJTmfTl/AXUGlaM6aChFojCbS; __Secure-3PAPISID=37NGJc_KytJTmfTl/AXUGlaM6aChFojCbS; VISITOR_INFO1_LIVE=jz8llnNU1U8; VISITOR_PRIVACY_METADATA=CgJJThIEGgAgOw%3D%3D; PREF=f6=40000000&tz=Asia.Calcutta&f7=100; YSC=RfyAfh_tg7o; SID=g.a000mQgqDxOB8zdNAS5YCGKOrX-CEPTrPcWgqiAZ5ELBZNYAiZ-Nd9XeZwLPjhRyjdXhqLEbsgACgYKAa4SARISFQHGX2MiLXWhebtjqSP_SkGPFWd00RoVAUF8yKqJUTbQuEklP1qADVyWerFY0076; __Secure-1PSID=g.a000mQgqDxOB8zdNAS5YCGKOrX-CEPTrPcWgqiAZ5ELBZNYAiZ-N6Q0nDuyVgIicnRM-2tKUKgACgYKAQkSARISFQHGX2MidyIMpmtV-oF14uCSPOlYGhoVAUF8yKqUckRgJ-BB2VNcc_z6XOWT0076; __Secure-3PSID=g.a000mQgqDxOB8zdNAS5YCGKOrX-CEPTrPcWgqiAZ5ELBZNYAiZ-Nb9uGEN9Fkn4OJ7zEDdQaJAACgYKATASARISFQHGX2Mi8YcJFy7PgFulL311zVIfbxoVAUF8yKpwjvug2vXx7YYLD8deRwQe0076; CONSISTENCY=AKreu9tbyY1gjr1bpCLoJir-y0fOTdesT_lwOUszxxW7uCSynuNagD447iBzXFi3YepouROCHJeTCvEG5b7QrgQIV-0kHYM-hra1ohlZvjE4BR4mb2x2S9-7dCs7-ZOnujmjRU4p0f-EycNGOBBLoMWT; __Secure-1PSIDTS=sidts-CjEB4E2dkY9p6_QVIqMlNLQ5B269ZEptO6ed5g5n-2D66KFMEhh2pYRSW8lWxJNDevSIEAA; __Secure-3PSIDTS=sidts-CjEB4E2dkY9p6_QVIqMlNLQ5B269ZEptO6ed5g5n-2D66KFMEhh2pYRSW8lWxJNDevSIEAA; SIDCC=AKEyXzUlzqV5J7a2R8R8Q-kVTMhbXiuGIBMy1yfnY-0-9yZAIJn9pYICDaJBlF6aWnKQk63vR8w; __Secure-1PSIDCC=AKEyXzW_gGAefJ2Uy-wTakODHoc9HpomzUQQdhuW47LFRtMll4jn74NQPNYa8P5pwgvIseLU4g; __Secure-3PSIDCC=AKEyXzXImXk7uD0vK5GoHgL0Q71-ivaApbY1rQxcb2PA-bnIqsqatQRwcCYert0TkLGoZLWIGvk;",
        },
      },
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

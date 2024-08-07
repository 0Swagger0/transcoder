const express = require("express");
const fs = require("fs");
const app = express();
const ytstream = require("yt-stream");
const port = 3000;

app.get("/stream", async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send("Missing YouTube video ID");
  }
  ytstream.setApiKey("AIzaSyAGA9Qf7bwq96eFE5GhAEAgQGmDryMlFNA");
  ytstream.setPreference("api", "ANDROID");
  ytstream.setGlobalHeaders({
    ":authority": "www.youtube.com",
    ":method": "GET",
    ":path": "/",
    ":scheme": "https",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "max-age=0",
    cookie:
      "LOGIN_INFO=AFmmF2swRAIgekjc3IZ5exa1gea6Uf5SXIpqwVssJpDYsv72Vzvpm_kCIEMSzuNSHSG0PPxlTsRnuwAgOKhy_On-GhXIGjD2lXQH:QUQ3MjNmekdoNGlmSXhhQ3R2WmxwaW0yLUMxcFo2Yl8xUGlqc2t6OS01SExVQTZxdXJGVklOZjdsNDYtNXl1VEV5MlRNRjZpZnlYTXJ6X0dyeXNVTDhibWdRRmRYWm9CWjhZdk5aV2lrTlZjZ0xFOHhwU2pPY041QlUzTzdIdlZ0VGFWSDBtSVlFdmhmendJVExkWnBxQTZpdW9ZcnNqWUFB; HSID=A3R66C9aGqUlhobaJ; SSID=A0Wxtv7gOITl5TGNN; APISID=L9iA9XDqN65MaLtO/A6W9-HS5k3fy1gNoT; SAPISID=37NGJc_KytJTmfTl/AXUGlaM6aChFojCbS; __Secure-1PAPISID=37NGJc_KytJTmfTl/AXUGlaM6aChFojCbS; __Secure-3PAPISID=37NGJc_KytJTmfTl/AXUGlaM6aChFojCbS; VISITOR_INFO1_LIVE=jz8llnNU1U8; VISITOR_PRIVACY_METADATA=CgJJThIEGgAgOw%3D%3D; PREF=f6=40000000&tz=Asia.Calcutta&f7=100; SID=g.a000mQgqDxOB8zdNAS5YCGKOrX-CEPTrPcWgqiAZ5ELBZNYAiZ-Nd9XeZwLPjhRyjdXhqLEbsgACgYKAa4SARISFQHGX2MiLXWhebtjqSP_SkGPFWd00RoVAUF8yKqJUTbQuEklP1qADVyWerFY0076; __Secure-1PSID=g.a000mQgqDxOB8zdNAS5YCGKOrX-CEPTrPcWgqiAZ5ELBZNYAiZ-N6Q0nDuyVgIicnRM-2tKUKgACgYKAQkSARISFQHGX2MidyIMpmtV-oF14uCSPOlYGhoVAUF8yKqUckRgJ-BB2VNcc_z6XOWT0076; __Secure-3PSID=g.a000mQgqDxOB8zdNAS5YCGKOrX-CEPTrPcWgqiAZ5ELBZNYAiZ-Nb9uGEN9Fkn4OJ7zEDdQaJAACgYKATASARISFQHGX2Mi8YcJFy7PgFulL311zVIfbxoVAUF8yKpwjvug2vXx7YYLD8deRwQe0076; YSC=Q0goDuGtoDo; __Secure-1PSIDTS=sidts-CjEB4E2dkbHC-RYxnzEYto0efe2kcoH7TLO2ikBmnF98uJjimy51NgTsqrSLiF6xOGtcEAA; __Secure-3PSIDTS=sidts-CjEB4E2dkbHC-RYxnzEYto0efe2kcoH7TLO2ikBmnF98uJjimy51NgTsqrSLiF6xOGtcEAA; SIDCC=AKEyXzVEopF88iM86p-RxrUBvVbYLm1GlHYhCyEQCk_hnJ5IppXQwFBl6tKCehEE7ymmLs6t66Q; __Secure-1PSIDCC=AKEyXzWL8biHjO7C16xMQsc2PyyuB_ZFlyVxudnlEpLc3ltUJUTjKcZGaTuEVkqDg4tO4oz0hQ; __Secure-3PSIDCC=AKEyXzXDZkCstq0E4PJ5Opxh7ckKvC8VF6s_BGw2fbYHxaF-Ykad2FU0KUaari1zvAcuwTc4Qa4",
    priority: "u=0, i",
    "sec-ch-ua":
      '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    "sec-ch-ua-arch": '"x86"',
    "sec-ch-ua-bitness": '"64"',
    "sec-ch-ua-form-factors": '"Desktop"',
    "sec-ch-ua-full-version": '"127.0.6533.89"',
    "sec-ch-ua-full-version-list":
      '"Not)A;Brand";v="99.0.0.0", "Google Chrome";v="127.0.6533.89", "Chromium";v="127.0.6533.89"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": '""',
    "sec-ch-ua-platform": '"macOS"',
    "sec-ch-ua-platform-version": '"14.2.1"',
    "sec-ch-ua-wow64": "?0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "service-worker-navigation-preload": "true",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
  });

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
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

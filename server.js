import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/bnm-proxy", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const session = req.query.session || "1200";
  const rateType = req.query.rate_type || "middle";

  const url = `https://api.bnm.gov.my/public/exchange-rate?rate_type=${rateType}&session=${session}&date=${date}`;

  try {
    const response = await fetch(url, {
      headers: { "Accept": "application/vnd.BNM.API.v1+json" },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "BNM API request failed" });
      return;
    }

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all frontends
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 min
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy server error", details: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ BNM Proxy running at http://localhost:${PORT}`));

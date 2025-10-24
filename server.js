import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send(`
    <h2>✅ BNM Proxy Server Running</h2>
    <p>Use <code>/api/bnm-proxy?date=YYYY-MM-DD</code> to fetch exchange rates.</p>
    <p>Example: <a href="/api/bnm-proxy?date=2025-10-24">/api/bnm-proxy?date=2025-10-24</a></p>
  `);
});

// ✅ Proxy route for BNM API
app.get("/api/bnm-proxy", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const session = req.query.session || "1200";
  const rateType = req.query.rate_type || "middle";

  const url = `https://api.bnm.gov.my/public/exchange-rate?rate_type=${rateType}&session=${session}&date=${date}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.BNM.API.v1+json" },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "BNM API request failed" });
      return;
    }

    const data = await response.json();

    // ✅ Allow CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "public, max-age=300");

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy server error", details: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ BNM Proxy running at http://localhost:${PORT}`));

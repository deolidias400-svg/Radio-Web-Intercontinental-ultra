import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Real-time API endpoint for Google daily search trends
  app.get("/api/google-trends", async (req, res) => {
    try {
      const geo = (req.query.geo as string) || "BR";
      const url = `https://trends.google.com/trending/rss?geo=${geo}`;
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Google Trends: ${response.statusText}`);
      }
      
      const xml = await response.text();
      const items: { query: string; traffic: string }[] = [];
      const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
      
      for (const match of itemMatches) {
        const itemContent = match[1];
        
        let title = "";
        const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
        
        let traffic = "";
        const trafficMatch = itemContent.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/i);
        if (trafficMatch) {
          traffic = trafficMatch[1].trim();
        }
        
        if (title) {
          items.push({ query: title, traffic });
        }
      }
      
      res.json({ success: true, geo, items });
    } catch (error: any) {
      console.error("Error fetching Google Trends:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development (or serve static build folder in production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

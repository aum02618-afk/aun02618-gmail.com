import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

dotenv.config();

// Lazy Initialize Firebase for querying
let dbInstance: any = null;
function getDb() {
  if (dbInstance) return dbInstance;
  try {
    if (fs.existsSync("./firebase-applet-config.json")) {
      const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
      const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      dbInstance = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
      return dbInstance;
    }
  } catch (err) {
    console.error("Firebase init error in server.ts:", err);
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API endpoint to retrieve pots info safely from Firestore
  app.get("/api/get-pots", async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: "Firestore is not initialized on server" });
      }
      const qFoods = query(collection(db, "foods"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(qFoods);
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtStr = "";
        if (data.createdAt) {
          // Check if firestore Timestamp
          if (typeof data.createdAt.toDate === "function") {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (data.createdAt.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
          } else {
            createdAtStr = String(data.createdAt);
          }
        }
        return {
          id: doc.id,
          name: data.name,
          createdAt: createdAtStr,
          category: data.category || "food",
          price: data.price
        };
      });
      return res.json(results);
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });

  // API router for LINE Notify
  app.post("/api/line-notify", async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const token = process.env.LINE_NOTIFY_TOKEN;
    if (!token) {
      console.log("LINE Notify token is not configured (optional integration).");
      return res.json({ success: true, status: "disabled", info: "LINE Notify token is not set" });
    }

    try {
      const response = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${token}`
        },
        body: new URLSearchParams({ message })
      });

      if (response.ok) {
        return res.json({ success: true, status: "sent" });
      } else {
        const errText = await response.text();
        console.log("LINE Notify API returned status:", response.status);
        return res.json({ success: true, status: "response_issue", details: "Status " + response.status });
      }
    } catch (error) {
      console.log("LINE Notify is currently offline or unreachable.");
      return res.json({ 
        success: true, 
        status: "offline",
        info: "LINE Notify could not be reached"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

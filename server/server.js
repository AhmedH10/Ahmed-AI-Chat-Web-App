import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// Fix __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../client")));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory chat history
let history = [];

// 🔹 Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt,
    });

    const reply = response.output_text || "No response";

    const entry = { prompt, reply };
    history.push(entry);

    res.json(entry);
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

// 🔹 Get chat history
app.get("/api/history", (req, res) => {
  res.json(history);
});

// 🔹 Clear chat history
app.delete("/api/history", (req, res) => {
  history = [];
  res.json({ message: "History cleared" });
});

// 🔹 Serve frontend (main route)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
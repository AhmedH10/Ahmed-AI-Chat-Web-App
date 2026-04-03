import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory chat history
let history = [];

// Chat endpoint
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
    console.error(err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

// Get history
app.get("/api/history", (req, res) => {
  res.json(history);
});

// Clear history
app.delete("/api/history", (req, res) => {
  history = [];
  res.json({ message: "History cleared" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
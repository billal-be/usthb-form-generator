const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Proxy endpoint for /chat
app.post("/chat", async (req, res) => {
  try {
    const response = await axios.post(
      "https://syyklo.pythonanywhere.com/chat",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for /generate
app.post("/generate", async (req, res) => {
  try {
    const response = await axios.post(
      "https://syyklo.pythonanywhere.com/generate",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log("Local proxy running on http://localhost:4000");
});
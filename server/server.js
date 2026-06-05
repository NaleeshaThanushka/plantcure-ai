// server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// .env file එකෙන් variables load කරනවා
dotenv.config();

const app = express();

// ---- Middleware ----
// Frontend (React) සමඟ communicate කරන්න CORS enable කරනවා
app.use(cors({
  origin: 'http://localhost:5173', // React Vite default port
  methods: ['GET', 'POST'],
}));

// JSON data receive කරන්න
app.use(express.json({ limit: '10mb' }));

// Base64 image data receive කරන්න (large size allow කරනවා)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Test Route ----
// Browser එකෙන් check කරන්නට
app.get('/', (req, res) => {
  res.json({
    message: '🌿 PlantCure AI Backend is Running!',
    status: 'OK',
    version: '1.0.0'
  });
});

// ---- Server Start ----
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
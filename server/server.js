// server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ---- Middleware ----
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Routes ----
const analyzeRoutes = require('./routes/analyzeRoutes');
app.use('/api/analyze', analyzeRoutes);

// ---- Test Route ----
app.get('/', (req, res) => {
  res.json({
    message: '🌿 PlantCure AI Backend is Running!',
    status: 'OK',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze'
    }
  });
});

// ---- Server Start ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
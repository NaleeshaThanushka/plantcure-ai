// server/controllers/analyzeController.js

const axios = require('axios');
const { getDiseaseInfo } = require('../data/diseaseData');

// Hugging Face API URL — plant disease model
const HF_API_URL = "https://api-inference.huggingface.co/models/linkanjarad/plant-disease-detection-using-cnn";

const analyzePlant = async (req, res) => {
  try {
    // Frontend එකෙන් base64 image data එනවා
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "No image data received"
      });
    }

    // Base64 string → Buffer convert කරනවා
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    console.log('📸 Image received, sending to Hugging Face...');

    // Hugging Face API call
    const hfResponse = await axios.post(
      HF_API_URL,
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/octet-stream',
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    const predictions = hfResponse.data;
    console.log('🤖 AI Response:', predictions);

    if (!predictions || predictions.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Could not analyze image. Please try with a clearer plant leaf photo."
      });
    }

    // Top prediction (highest confidence) ගන්නවා
    const topPrediction = predictions[0];
    const diseaseName = topPrediction.label;
    const confidence = (topPrediction.score * 100).toFixed(2);

    console.log(`✅ Detected: ${diseaseName} (${confidence}% confidence)`);

    // Database එකෙන් medicine info ගන්නවා
    const diseaseInfo = getDiseaseInfo(diseaseName);

    // Frontend එකට response යවනවා
    res.status(200).json({
      success: true,
      data: {
        detectedDisease: diseaseName,
        confidence: parseFloat(confidence),
        diseaseInfo: diseaseInfo,
        allPredictions: predictions.slice(0, 3) // Top 3 predictions
      }
    });

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);

    // Hugging Face model loading error handle කරනවා
    if (error.response?.status === 503) {
      return res.status(503).json({
        success: false,
        message: "AI model is loading, please wait 20 seconds and try again.",
        retryAfter: 20
      });
    }

    res.status(500).json({
      success: false,
      message: "Analysis failed. Please try again.",
      error: error.message
    });
  }
};

module.exports = { analyzePlant };
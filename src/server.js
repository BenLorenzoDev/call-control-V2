const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { apiKey, phoneNumberId, assistantId, apiBaseUrl, webhookUrl } = require("./config");

const app = express();

// Configure CORS to allow requests from React dev server and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  process.env.FRONTEND_URL // For production (Railway will set this)
].filter(Boolean);

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        // In production, allow same-origin requests or configured origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow all for now, you can restrict later
        }
      }
    : allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Serve React build files in production, public folder in development
const isProduction = process.env.NODE_ENV === 'production';
const staticPath = isProduction 
  ? path.join(__dirname, "../client/build")
  : path.join(__dirname, "../public");

app.use(express.static(staticPath));

// Backend functions integrated into server.js
async function pollCallStatus(callId) {
  const maxRetries = 30; 
  const delay = 2000; 

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${apiBaseUrl}/call/${callId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const callData = response.data;
      console.log(`Polling attempt ${i + 1}: Status - ${callData.status}`);

      if (callData.status === "in-progress" && callData.monitor && callData.monitor.listenUrl) {
        console.log("Listen URL available:", callData.monitor.listenUrl);
        return {
          listenUrl: callData.monitor.listenUrl,
          status: callData.status,
          callId: callId
        };
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      console.error("Error polling call status:", error.response?.data || error.message);
    }
  }

  throw new Error("Listen URL not available after polling.");
}

async function initiateCall(phoneNumber, customerName) {
  try {
    const payload = {
      phoneNumberId,
      customer: {
        number: phoneNumber,
        name: customerName || "Unknown",
      },
      assistantId,
    };

    console.log("Payload being sent to Vapi:", JSON.stringify(payload, null, 2));
    console.log("Using API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET");
    console.log("Using phoneNumberId:", phoneNumberId);
    console.log("Using assistantId:", assistantId);

    const response = await axios.post(`${apiBaseUrl}/call`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const callId = response.data.id;
    console.log("Call initiated. Call ID:", callId);

    const callData = await pollCallStatus(callId);
    return callData;
  } catch (error) {
    console.error("Error initiating call:");
    console.error("Status:", error.response?.status);
    console.error("Response data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Message:", error.message);
    throw error;
  }
}

async function controlCall(controlUrl, payload) {
  try {
    const response = await axios.post(controlUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Message injected successfully:", response.data);
  } catch (error) {
    console.error("Error controlling call:", error.response?.data || error.message);
    throw error;
  }
}

// API Routes
app.post("/initiate-call", async (req, res) => {
  try {
    console.log("Received initiate-call request:", req.body);
    const callData = await initiateCall(req.body.phoneNumber, req.body.customerName);
    res.status(200).json({ success: true, ...callData });
  } catch (error) {
    console.error("Error initiating call:", error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data || {};
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: errorDetails
    });
  }
});

app.post("/control-call", async (req, res) => {
  const { controlUrl, ...payload } = req.body;
  console.log("Received controlUrl:", controlUrl);
  console.log("Payload:", payload);

  try {
    await controlCall(controlUrl, payload);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error controlling call:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get call status endpoint for polling
app.get("/call-status/:callId", async (req, res) => {
  try {
    const { callId } = req.params;

    const response = await axios.get(`${apiBaseUrl}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const callData = response.data;
    res.status(200).json({
      success: true,
      status: callData.status,
      endedReason: callData.endedReason || null,
      duration: callData.duration || null
    });
  } catch (error) {
    console.error("Error getting call status:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/submit-disposition", async (req, res) => {
  try {
    console.log("Received disposition data:", req.body);

    // If no webhook URL is configured, just log the data
    if (!webhookUrl || webhookUrl === "") {
      console.log("No webhook URL configured. Disposition data logged only.");
      return res.status(200).json({
        success: true,
        message: "Disposition saved (no webhook configured)"
      });
    }

    // Forward disposition data to configured webhook
    const response = await axios.post(webhookUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    console.log("Webhook response:", response.status, response.data);

    res.status(200).json({
      success: true,
      message: "Disposition submitted successfully",
      webhookResponse: response.data
    });
  } catch (error) {
    console.error("Error submitting disposition to webhook:", error.message);

    // Even if webhook fails, we don't want to fail the disposition submission
    // Log the error but return success to the client
    res.status(200).json({
      success: true,
      message: "Disposition saved (webhook error logged)",
      error: error.message
    });
  }
});

app.get("*", (req, res) => {
  const indexPath = isProduction 
    ? path.join(__dirname, "../client/build/index.html")
    : path.join(__dirname, "../client/public/index.html");
  res.sendFile(indexPath);
});

const port = process.env.PORT || 8080; 
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
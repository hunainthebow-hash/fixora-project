import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pg from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Permissive for Vite dev and inline assets in SPA
    crossOriginEmbedderPolicy: false,
  })
);

// General Rate Limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again later." },
});

app.use("/api/", apiLimiter);
app.use(express.json());

// Database Pool (PostgreSQL with SSL support)
let dbPool: pg.Pool | null = null;

const getDbPool = () => {
  if (dbPool) return dbPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("CHANGE_ME")) {
    return null;
  }
  try {
    dbPool = new pg.Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    return dbPool;
  } catch (err) {
    console.error("Failed to initialize database pool:", err);
    return null;
  }
};

// Initialize Gemini Client
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using smart fallback heuristic responses.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check
app.get("/api/health", (req, res) => {
  const pool = getDbPool();
  res.json({
    status: "ok",
    appName: "Fixora On-Demand Local Services & AI Marketplace",
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    dbConnected: Boolean(pool),
    supportedCities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"],
    currency: "PKR / USD"
  });
});


// Helper for smart heuristic fallback responses when API keys or model endpoints are under high demand (503/429)
function computeFallbackAIResponse(query: string, city: string = "Karachi") {
  const lower = (query || "").toLowerCase();
  let category = "plumbing";
  let urgency: "emergency" | "urgent" | "standard" = "standard";
  let problemTitle = "General Plumbing Repair";
  let advice = "Turn off the main angle valve if there is water leakage. A verified Fixora plumber will inspect it.";
  let estimatedCostRange = "₨ 1,200 - ₨ 2,500";

  if (lower.includes("plumber") || lower.includes("pipe") || lower.includes("leak") || lower.includes("tap") || lower.includes("nal") || lower.includes("pani") || lower.includes("drain")) {
    category = "plumbing";
    problemTitle = "Pipe Leakage / Sanitary Repair";
    estimatedCostRange = "₨ 1,200 - ₨ 2,500";
    advice = "Please shut off the angle valve near the fixture or the main overhead tank valve to prevent water damage.";
  } else if (lower.includes("electric") || lower.includes("short circuit") || lower.includes("light") || lower.includes("wire") || lower.includes("bijli") || lower.includes("breaker") || lower.includes("mcb") || lower.includes("spark")) {
    category = "electrical";
    problemTitle = "Short Circuit & DB Breaker Repair";
    advice = "Please turn off the main circuit breaker (MCB) immediately to prevent electrical hazard.";
    estimatedCostRange = "₨ 1,200 - ₨ 3,000";
  } else if (lower.includes("ac") || lower.includes("air conditioner") || lower.includes("cooling") || lower.includes("gas refill") || lower.includes("jet pump") || lower.includes("inverter")) {
    category = "ac_repair";
    problemTitle = "Inverter AC Chemical Wash & Gas Refill";
    advice = "Keep AC switched off if compressor is tripping or producing humming noise.";
    estimatedCostRange = "₨ 2,500 - ₨ 5,500";
  } else if (lower.includes("fridge") || lower.includes("refrigerator") || lower.includes("washing") || lower.includes("appliance") || lower.includes("microwave") || lower.includes("oven") || lower.includes("tv") || lower.includes("geyser")) {
    category = "appliance_repair";
    problemTitle = "Home Appliance Diagnostic & Repair";
    advice = "Unplug the appliance if you observe abnormal vibrations or burning smell.";
    estimatedCostRange = "₨ 1,800 - ₨ 4,000";
  } else if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android") || lower.includes("screen cracked") || lower.includes("phone")) {
    category = "mobile_repair";
    problemTitle = "Smartphone Screen & Battery Replacement";
    advice = "Avoid charging the phone if the battery is swollen or back cover is popping.";
    estimatedCostRange = "₨ 1,500 - ₨ 6,500";
  } else if (lower.includes("computer") || lower.includes("laptop") || lower.includes("macbook") || lower.includes("ssd") || lower.includes("ram") || lower.includes("wifi")) {
    category = "computer_repair";
    problemTitle = "Laptop Hardware & OS Troubleshooting";
    advice = "Back up critical files if possible. A certified IT technician can diagnose on-site.";
    estimatedCostRange = "₨ 2,000 - ₨ 4,500";
  } else if (lower.includes("clean") || lower.includes("safai") || lower.includes("maid") || lower.includes("sofa") || lower.includes("carpet") || lower.includes("deep clean")) {
    category = "cleaning";
    problemTitle = "Deep Sofa & Home Shampoo Wash";
    advice = "Ensure fragile items are safely stored before cleaning staff arrives.";
    estimatedCostRange = "₨ 3,500 - ₨ 8,500";
  } else if (lower.includes("mechanic") || lower.includes("puncture") || lower.includes("car") || lower.includes("bike") || lower.includes("gaadi") || lower.includes("jumpstart") || lower.includes("battery dead")) {
    category = "mechanic";
    problemTitle = "Roadside Breakdown & Puncture Service";
    advice = "Turn on your vehicle hazard lights and ensure you are parked in a safe spot.";
    estimatedCostRange = "₨ 1,000 - ₨ 2,500";
  } else if (lower.includes("carpenter") || lower.includes("wood") || lower.includes("door") || lower.includes("lock") || lower.includes("bed") || lower.includes("furniture")) {
    category = "carpentry";
    problemTitle = "Furniture Repair & Door Lock Fitting";
    estimatedCostRange = "₨ 1,500 - ₨ 3,500";
  } else if (lower.includes("doctor") || lower.includes("nurse") || lower.includes("health") || lower.includes("blood") || lower.includes("sugar") || lower.includes("bp")) {
    category = "healthcare";
    problemTitle = "Home Nursing & Health Checkup";
    estimatedCostRange = "₨ 1,500 - ₨ 3,000";
  } else if (lower.includes("paint") || lower.includes("rang") || lower.includes("wall") || lower.includes("waterproofing")) {
    category = "painting";
    problemTitle = "Wall Paint & Waterproofing Treatment";
    estimatedCostRange = "₨ 4,000 - ₨ 12,000";
  }

  if (lower.includes("emergency") || lower.includes("urgent") || lower.includes("jaldi") || lower.includes("turant") || lower.includes("burst") || lower.includes("smoke") || lower.includes("bleeding") || lower.includes("short circuit")) {
    urgency = "emergency";
    advice = "Emergency detected! Please maintain safety precautions. Nearest on-call verified Fixora technicians are ready for 15-min priority dispatch.";
  }

  return {
    category,
    urgency,
    problemTitle,
    advice,
    estimatedCostRange,
    summary: `Processed query: "${query}". Category matched to ${category} (${urgency}) in ${city}.`,
    suggestedActions: [
      urgency === "emergency" ? "Instant 15-Min Emergency Dispatch" : "Book Top-Rated Technician",
      "Check Local PKR Rates",
      "Start Live Chat"
    ],
    spokenResponse: urgency === "emergency" 
      ? `Emergency detected in ${category}. I have located nearby on-call verified technicians ready to dispatch to your location in ${city}.`
      : `I have identified the issue as ${problemTitle}. Top-rated verified experts in ${city} are available right now.`,
    matchScore: 95
  };
}

// AI Assistant & Voice Query Processing with Pakistan City Context
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { query, userLocation, language = "auto", city = "Karachi" } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(computeFallbackAIResponse(query, city));
    }

    // Call Gemini for natural language understanding with resilient fallback across models
    const systemPrompt = `You are the intelligent Voice & Service Dispatch AI for 'Fixora' - Pakistan's premier on-demand local services & technician marketplace.
The user speaks in English, Urdu, Roman Urdu, or mixed Hinglish (e.g. "Mujhe emergency plumber chahiye nal toot gaya hai", "AC cooling nahi kar raha gas leak lag raha hai", "Short circuit hua hai bijli ka electrician bhejo", "Car battery dead ho gayi").

Your task is to analyze the user's voice/text input and return a clean JSON object with:
1. "category": One of ["plumbing", "electrical", "carpentry", "ac_repair", "appliance_repair", "painting", "cleaning", "it_services", "tutoring", "mechanic", "moving", "maintenance", "healthcare", "handyman", "gardening", "car_wash", "mobile_repair", "computer_repair"].
2. "urgency": "emergency" (active water leaks, gas leaks, sparks, breakdown, severe hazard requiring 15-30 min arrival), "urgent" (today), or "standard" (scheduled).
3. "problemTitle": Concise title of the issue (e.g., "Burst Pipe & Flooding Emergency", "Inverter AC Gas Charge & Master Wash", "Short Circuit DB Repair").
4. "advice": 1-2 practical instant safety or preparatory tips in friendly language (e.g. "Main water valve band kar dein jab tak technician pohanchay.").
5. "estimatedCostRange": Local Pakistani Rupee benchmark range (e.g. "₨ 1,500 - ₨ 3,000" or "₨ 2,500 - ₨ 5,500").
6. "suggestedActions": Array of 2-3 short action suggestions.
7. "spokenResponse": A short, polite 1-2 sentence spoken reply suitable for text-to-speech.

Always respond in strictly valid JSON without markdown formatting.`;

    let parsed: any = null;
    const modelsToTry = ["gemini-3.7-flash", "gemini-flash-latest"];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `User Query: "${query}". Location context: ${userLocation || city || "Karachi, Pakistan"}.`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text || "{}";
        const candidate = JSON.parse(responseText);
        if (candidate && candidate.category) {
          parsed = candidate;
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[Gemini API] Model ${modelName} error (${modelErr?.status || modelErr?.message || modelErr}), trying fallback if available...`);
      }
    }

    if (parsed && parsed.category) {
      return res.json(parsed);
    }

    // If Gemini models encountered high demand (503/429) or parsing issues, smoothly return high-accuracy heuristic fallback
    return res.json(computeFallbackAIResponse(query, city));
  } catch (error: any) {
    console.error("AI Assistant outer handler, using fallback:", error);
    const query = req.body?.query || "";
    const city = req.body?.city || "Karachi";
    return res.json(computeFallbackAIResponse(query, city));
  }
});

// AI Cost & Diagnostics Estimator
app.post("/api/ai/estimate", async (req, res) => {
  const { category = "plumbing", description = "", serviceType = "Standard" } = req.body;
  try {
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Estimate repair requirements for local home service:
Category: ${category}
Service Type: ${serviceType || "Standard"}
User Issue Description: ${description || "General maintenance and repair"}

Provide JSON with:
1. "estimatedTime": e.g. "45 - 75 minutes"
2. "estimatedLaborCost": e.g. "$40 - $65"
3. "estimatedPartsCost": e.g. "$10 - $30"
4. "commonIssues": array of 2-3 likely root causes
5. "recommendation": 1 sentence guidance for customer.`;

      const modelsToTry = ["gemini-3.7-flash", "gemini-flash-latest"];
      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const result = JSON.parse(response.text || "{}");
          if (result && result.estimatedTime) {
            return res.json(result);
          }
        } catch (mErr) {
          console.warn(`[Estimate API] Model ${modelName} error:`, mErr);
        }
      }
    }
  } catch (error: any) {
    console.error("AI Estimate error:", error);
  }

  return res.json({
    estimatedTime: "45 - 90 mins",
    estimatedLaborCost: "$40 - $70",
    estimatedPartsCost: "$15 - $40",
    commonIssues: ["Normal wear and tear", "Connection or filter servicing", "Component diagnostic required"],
    recommendation: "Book a diagnostic visit. Standard inspection fee applies if work is not undertaken."
  });
});

// Live API Capabilities & Status Check
app.get("/api/live/status", (req, res) => {
  res.json({
    liveApiSupported: true,
    model: "gemini-3.1-flash-live-preview",
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    sampleRates: {
      inputRate: 16000,
      outputRate: 24000,
    },
    message: "Fixora Live Voice Assistant with Gemini 3.1 Flash Live Preview ready"
  });
});

// Setup Vite / Static handling and Live WebSocket Server
async function startServer() {
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

  const server = http.createServer(app);

  // WebSocket Server for Gemini Live API Voice Conversations
  const wss = new WebSocketServer({ server, path: "/api/live" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("[Live API] Client connected to /api/live");
    let liveSession: any = null;
    let isClosed = false;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Live API] GEMINI_API_KEY is not configured.");
      clientWs.send(JSON.stringify({
        type: "status",
        status: "no_key",
        message: "Gemini API key is not configured in environment. Using smart simulated assistant mode.",
      }));

      clientWs.on("message", (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          if (payload.type === "text" && payload.text) {
            const query = payload.text;
            const reply = `Fixora Voice Assistant: I understand you need help with "${query}". We have verified technicians ready for dispatch across Karachi, Lahore, and Islamabad!`;
            setTimeout(() => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: "text", text: reply }));
                clientWs.send(JSON.stringify({ type: "turnComplete" }));
              }
            }, 300);
          }
        } catch (err) {
          console.error("[Live API] Error handling client fallback message:", err);
        }
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Connect to gemini-3.1-flash-live-preview
      liveSession = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are the Fixora Live Voice Assistant, an intelligent, empathetic voice AI for Fixora - Pakistan's premier on-demand local services platform (Karachi, Lahore, Islamabad, Rawalpindi, etc.).
You help customers and technicians with:
1. Identifying home issues (plumbing leaks, electrical trips/sparks, AC cooling/gas problems, appliance faults, car breakdown, cleaning).
2. Triage urgency: instant 15-minute emergency dispatch vs scheduled service.
3. Estimating typical Pakistani Rupee (PKR) price ranges.
4. Explaining Fixora Escrow protection and verified CNIC professionals.
Respond concisely, naturally, and warmly in English, Urdu, or Roman Urdu depending on how the user addresses you. Keep spoken answers short, clear, and direct so real-time conversation is fluid and natural.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

            // Model Turn Parts (audio & text)
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({
                    type: "audio",
                    audio: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || "audio/pcm;rate=24000",
                  }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({
                    type: "text",
                    text: part.text,
                  }));
                }
              }
            }

            // Model interrupted by user speech
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            // Model turn completed
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
            }
          },
          onerror: (err: any) => {
            console.error("[Live API] Session error:", err);
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: "error",
                error: err?.message || "Live API session encountered an error",
              }));
            }
          },
          onclose: () => {
            console.log("[Live API] Session closed");
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "sessionClosed" }));
            }
          },
        },
      });

      console.log("[Live API] Connected to gemini-3.1-flash-live-preview successfully");
      clientWs.send(JSON.stringify({
        type: "connected",
        model: "gemini-3.1-flash-live-preview",
        message: "Connected to Gemini 3.1 Flash Live session",
      }));

      // Handle audio and text messages from the client
      clientWs.on("message", (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          if (payload.type === "audio" && payload.audio) {
            liveSession?.sendRealtimeInput({
              audio: {
                data: payload.audio,
                mimeType: payload.mimeType || "audio/pcm;rate=16000",
              },
            });
          } else if (payload.type === "text" && payload.text) {
            liveSession?.sendClientContent({
              turns: [{ role: "user", parts: [{ text: payload.text }] }],
              turnComplete: true,
            });
          } else if (payload.type === "audioStreamEnd") {
            liveSession?.sendRealtimeInput({
              audioStreamEnd: true,
            });
          }
        } catch (e) {
          console.error("[Live API] Error processing client message:", e);
        }
      });

      clientWs.on("close", () => {
        isClosed = true;
        try {
          liveSession?.close();
        } catch (e) {}
      });

      clientWs.on("error", (e) => {
        console.error("[Live API] Client socket error:", e);
        isClosed = true;
        try {
          liveSession?.close();
        } catch (e) {}
      });

    } catch (connectErr: any) {
      console.warn("[Live API] Live connection failed or experiencing high demand, falling back to interactive simulated mode:", connectErr?.message || connectErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: "status",
          status: "fallback",
          message: "Live API is experiencing high demand. Switched to fast interactive text & diagnostic mode.",
        }));

        clientWs.on("message", (raw) => {
          try {
            const payload = JSON.parse(raw.toString());
            if (payload.type === "text" && payload.text) {
              const query = payload.text;
              const fallback = computeFallbackAIResponse(query);
              const reply = `${fallback.spokenResponse} Typical local estimate: ${fallback.estimatedCostRange}. ${fallback.advice}`;
              setTimeout(() => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: "text", text: reply }));
                  clientWs.send(JSON.stringify({ type: "turnComplete" }));
                }
              }, 300);
            }
          } catch (err) {
            console.error("[Live API] Fallback message handler error:", err);
          }
        });
      }
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Fixora Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

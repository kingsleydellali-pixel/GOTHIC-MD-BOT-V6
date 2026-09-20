// ============================================
//  GOTHIC MD BOT - Settings Configuration
//  Made by KINGSLEY-XMD
// ============================================

export const settings = {
  botName: process.env.BOT_NAME || "GOTHIC MD BOT",
  ownerName: process.env.OWNER_NAME || "KINGSLEY-XMD",
  ownerNumber: process.env.OWNER_NUMBER || "233535502036",
  prefix: process.env.PREFIX || ".",
  sessionId: process.env.SESSION_ID || "",

  // Channel
  channelId: process.env.CHANNEL_ID || "0029Vb6zdPc5vKAAAY0imG2R",
  channelLink: `https://whatsapp.com/channel/${process.env.CHANNEL_ID || "0029Vb6zdPc5vKAAAY0imG2R"}`,
  autoJoinChannel: process.env.AUTO_JOIN_CHANNEL === "true",
  autoReactChannel: process.env.AUTO_REACT_CHANNEL === "true",
  channelReactions: (process.env.CHANNEL_REACTIONS || "❤️,🔥,💯,⚡,🎯,💀,👑,🚀").split(","),

  botImage: process.env.BOT_IMAGE || "https://i.ibb.co/zVyCpvQX/ERFAN-MD.jpg",
  timezone: process.env.TIMEZONE || "Africa/Accra",

  // ============================================
  //  API KEYS (Loaded from .env)
  // ============================================
  api: {
    // AI
    openai: {
      key: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      url: "https://api.openai.com/v1/chat/completions"
    },
    gemini: {
      key: process.env.GEMINI_API_KEY || "",
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      url: "https://generativelanguage.googleapis.com/v1beta/models"
    },
    groq: {
      key: process.env.GROQ_API_KEY || "",
      model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
      url: "https://api.groq.com/openai/v1/chat/completions"
    },
    deepseek: {
      key: process.env.DEEPSEEK_API_KEY || "",
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      url: "https://api.deepseek.com/chat/completions"
    },
    huggingface: {
      key: process.env.HUGGINGFACE_API_KEY || "",
      url: "https://api-inference.huggingface.co/models"
    },

    // Search
    google: {
      key: process.env.GOOGLE_API_KEY || "",
      cseId: process.env.GOOGLE_CSE_ID || ""
    },
    serpapi: { key: process.env.SERPAPI_KEY || "" },
    newsapi: { key: process.env.NEWSAPI_KEY || "" },
    weather: { key: process.env.WEATHER_API_KEY || "" },

    // Download
    rapidapi: {
      key: process.env.RAPIDAPI_KEY || "",
      host: process.env.RAPIDAPI_HOST || "youtube-mp36.p.rapidapi.com"
    },

    // Utility
    imgbb: { key: process.env.IMGBB_API_KEY || "" },
    removebg: { key: process.env.REMOVEBG_API_KEY || "" },
    ocr: { key: process.env.OCR_API_KEY || "" },

    // Pairing site
    pairing: {
      url: process.env.PAIRING_SITE_URL || "",
      key: process.env.PAIRING_API_KEY || ""
    }
  }
};

export default settings;

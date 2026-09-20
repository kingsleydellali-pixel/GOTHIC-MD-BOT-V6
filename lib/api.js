// ============================================
//  API WRAPPER - GOTHIC MD BOT
//  Made by KINGSLEY-XMD
// ============================================
import axios from "axios";
import settings from "../settings.js";

const { api } = settings;

// ============================================
//  AI: OpenAI (ChatGPT)
// ============================================
export async function askOpenAI(prompt) {
  if (!api.openai.key) throw new Error("OpenAI API key missing");
  const res = await axios.post(
    api.openai.url,
    {
      model: api.openai.model,
      messages: [
        { role: "system", content: "You are GOTHIC MD BOT, a helpful WhatsApp assistant made by KINGSLEY-XMD. Reply concisely." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1024
    },
    { headers: { Authorization: `Bearer ${api.openai.key}`, "Content-Type": "application/json" } }
  );
  return res.data.choices[0].message.content;
}

// ============================================
//  AI: Google Gemini
// ============================================
export async function askGemini(prompt) {
  if (!api.gemini.key) throw new Error("Gemini API key missing");
  const url = `${api.gemini.url}/${api.gemini.model}:generateContent?key=${api.gemini.key}`;
  const res = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }]
  });
  return res.data.candidates[0].content.parts[0].text;
}

// ============================================
//  AI: Groq (Fast & Free)
// ============================================
export async function askGroq(prompt) {
  if (!api.groq.key) throw new Error("Groq API key missing");
  const res = await axios.post(
    api.groq.url,
    {
      model: api.groq.model,
      messages: [
        { role: "system", content: "You are GOTHIC MD BOT by KINGSLEY-XMD." },
        { role: "user", content: prompt }
      ]
    },
    { headers: { Authorization: `Bearer ${api.groq.key}` } }
  );
  return res.data.choices[0].message.content;
}

// ============================================
//  AI: DeepSeek
// ============================================
export async function askDeepSeek(prompt) {
  if (!api.deepseek.key) throw new Error("DeepSeek API key missing");
  const res = await axios.post(
    api.deepseek.url,
    {
      model: api.deepseek.model,
      messages: [{ role: "user", content: prompt }]
    },
    { headers: { Authorization: `Bearer ${api.deepseek.key}` } }
  );
  return res.data.choices[0].message.content;
}

// ============================================
//  AI: Smart Router (auto-picks available API)
// ============================================
export async function askAI(prompt, preferred = "auto") {
  if (preferred === "openai" && api.openai.key) return askOpenAI(prompt);
  if (preferred === "gemini" && api.gemini.key) return askGemini(prompt);
  if (preferred === "groq" && api.groq.key) return askGroq(prompt);
  if (preferred === "deepseek" && api.deepseek.key) return askDeepSeek(prompt);

  // Auto fallback order
  if (api.groq.key) return askGroq(prompt);
  if (api.gemini.key) return askGemini(prompt);
  if (api.openai.key) return askOpenAI(prompt);
  if (api.deepseek.key) return askDeepSeek(prompt);

  throw new Error("No AI API key configured. Add one in .env");
}

// ============================================
//  AI: Image Generation (Hugging Face)
// ============================================
export async function generateImage(prompt) {
  if (!api.huggingface.key) throw new Error("HuggingFace API key missing");
  const res = await axios.post(
    `${api.huggingface.url}/stabilityai/stable-diffusion-xl-base-1.0`,
    { inputs: prompt },
    {
      headers: { Authorization: `Bearer ${api.huggingface.key}` },
      responseType: "arraybuffer"
    }
  );
  return Buffer.from(res.data);
}

// ============================================
//  Weather
// ============================================
export async function getWeather(city) {
  if (!api.weather.key) throw new Error("Weather API key missing");
  const res = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api.weather.key}&units=metric`
  );
  const d = res.data;
  return `🌍 *${d.name}, ${d.sys.country}*\n🌡️ Temp: ${d.main.temp}°C\n☁️ Weather: ${d.weather[0].description}\n💧 Humidity: ${d.main.humidity}%\n💨 Wind: ${d.wind.speed} m/s`;
}

// ============================================
//  News
// ============================================
export async function getNews() {
  if (!api.newsapi.key) throw new Error("NewsAPI key missing");
  const res = await axios.get(
    `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${api.newsapi.key}`
  );
  return res.data.articles
    .map((a, i) => `${i + 1}. *${a.title}*\n   ${a.url}`)
    .join("\n\n");
}

// ============================================
//  Google Search (Custom Search)
// ============================================
export async function googleSearch(query) {
  if (!api.google.key || !api.google.cseId) throw new Error("Google API key missing");
  const res = await axios.get(
    `https://www.googleapis.com/customsearch/v1?key=${api.google.key}&cx=${api.google.cseId}&q=${encodeURIComponent(query)}`
  );
  return res.data.items
    ?.slice(0, 5)
    .map((item, i) => `${i + 1}. *${item.title}*\n${item.link}\n${item.snippet}`)
    .join("\n\n") || "No results found.";
}

// ============================================
//  YouTube MP3 (RapidAPI)
// ============================================
export async function getYouTubeAudio(videoId) {
  if (!api.rapidapi.key) throw new Error("RapidAPI key missing");
  const res = await axios.get(
    `https://${api.rapidapi.host}/dl?id=${videoId}`,
    {
      headers: {
        "X-RapidAPI-Key": api.rapidapi.key,
        "X-RapidAPI-Host": api.rapidapi.host
      }
    }
  );
  return res.data.link;
}

// ============================================
//  Remove Background
// ============================================
export async function removeBackground(imageUrl) {
  if (!api.removebg.key) throw new Error("RemoveBG key missing");
  const res = await axios.post(
    "https://api.remove.bg/v1.0/removebg",
    { image_url: imageUrl, size: "auto" },
    {
      headers: { "X-Api-Key": api.removebg.key },
      responseType: "arraybuffer"
    }
  );
  return Buffer.from(res.data);
}

// ============================================
//  OCR (Image to Text)
// ============================================
export async function ocrImage(imageUrl) {
  if (!api.ocr.key) throw new Error("OCR key missing");
  const res = await axios.get(
    `https://api.ocr.space/parse/imageurl?apikey=${api.ocr.key}&url=${encodeURIComponent(imageUrl)}`
  );
  return res.data.ParsedResults?.[0]?.ParsedText || "No text found.";
}

// ============================================
//  Check which APIs are configured
// ============================================
export function getApiStatus() {
  const status = {};
  const check = (obj, name) => {
    status[name] = obj.key ? "✅ Configured" : "❌ Missing";
  };
  check(api.openai, "OpenAI");
  check(api.gemini, "Gemini");
  check(api.groq, "Groq");
  check(api.deepseek, "DeepSeek");
  check(api.huggingface, "HuggingFace");
  check(api.weather, "Weather");
  check(api.newsapi, "NewsAPI");
  check(api.google, "Google Search");
  check(api.rapidapi, "RapidAPI");
  check(api.removebg, "RemoveBG");
  check(api.ocr, "OCR");
  check(api.imgbb, "ImgBB");
  return status;
      }

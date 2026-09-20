// ============================================
//  GOTHIC MD BOT - Main Entry Point
//  Made by KINGSLEY-XMD
//  Deployable on Render.com
// ============================================

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import express from "express";
import fs from "fs-extra";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import * as API from "./lib/api.js";
import settings from "./settings.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: "silent" });

// ============================================
//  EXPRESS SERVER (for Render health check)
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <h1>👑 GOTHIC MD BOT</h1>
    <p>Made by KINGSLEY-XMD</p>
    <p>Status: ✅ Online</p>
    <p>Prefix: ${settings.prefix}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ============================================
//  SESSION LOADING (from SESSION_ID env)
// ============================================
async function loadSession() {
  const sessionDir = path.join(__dirname, "session");
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  if (settings.sessionId && settings.sessionId !== "GOTHIC-MD:~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiV0RSVzZoUk5oTlVsNGtzVlVhS0gvVDJIQ2YzemZzbHM3T1QydTJJWERsST0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQlExNHBmT3NzaktRVkpqNjYxSjM2dTZOWUdiWncycjZJRnFpdXo1MUhrYz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJJRzMvcnVST3N5bTFkUkE1VEJRVzZwVVBqYmxJbjFtQXRTMkdldmhoRUdFPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiIxYU9yYVJTTWx6VUZqWkVROGdrOGNzVk9nUEpkMDZwYVJZckdSTGRmVlM0PSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImlDc1BGa0pnNjI1ekpxSXFjVXBremtCeG9HYjRlNmRmYjhHRjQ1R2dFSGc9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InF6NE1LMDRIaGVCZGFJUmRKOXI2eENBVmRSTjZnK005WWlCWHM4VjN1M2M9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQUNtUm9aWENLVnRORnpWVkZYNEN1V3FpOVZwQjFuS0F0RGNEdG9Ha25VQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiS0FiU0o0ZWJGaG1uK1NDZEhEMWdlNmlqZU5vbXgrT25YcDhYYXg2S0FSOD0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InRaQ2h4cFFVaTdSUHhFTHYzN3ZXZFBZWUpxVG1nK1p3a2c4TFNuWDhCLzRlb1NZakxLNTBmVmJGc3lmRU9TTlZuMDNMSnNySFFoTWtlK2NBNGwwV0N3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTc1LCJhZHZTZWNyZXRLZXkiOiJCak1PbTVESC9QRmFxbzdpS2M2UXRNTkVpcmFUaERxbUZDVThCeWtiT09nPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwicmVnaXN0ZXJlZCI6dHJ1ZSwicGFpcmluZ0NvZGUiOiJQSlNCSkRZUyIsIm1lIjp7ImlkIjoiMjMzNTM1NTAyMDM2OjY3QHMud2hhdHNhcHAubmV0IiwibGlkIjoiMTIyOTQ4MjAzNTkzOTE5OjY3QGxpZCIsIm5hbWUiOiLilpHilpLilpPiloggS0lOR1NMRVktWE1EIFRFQ0gg4paIIn0sImFjY291bnQiOnsiZGV0YWlscyI6IkNMQ3ZucFVDRU1XMHY5VUdHQUVnQUNnQSIsImFjY291bnRTaWduYXR1cmVLZXkiOiJ5UzJia01OcVY1L0dpS29kUnNYamkxb1NoQUdlZUxhT2VUNnJqeSsrWDJFPSIsImFjY291bnRTaWduYXR1cmUiOiIyKy83ZjJjaWtnL2N6d091N2RiWkU4N2NmMjdMZFloSzU3ZjJZRFRoU3FIdlNXUDl1SCtUMjdWcXNvOVNFT3VhUTN0anlIZGNoL0lqRjFoZi9PbVBBQT09IiwiZGV2aWNlU2lnbmF0dXJlIjoiSWw2eXNGYVlxODQwS3h3VVRtT3dyczNXRmEyNUYzaUdzeTJwMmc0aXR1cHUzKzdPNVdINzBXUzkyOUFoVGpudVcyZ01ZOFVzN2YrSm9mdGdVMWlRRGc9PSJ9LCJzaWduYWxJZGVudGl0aWVzIjpbeyJpZGVudGlmaWVyIjp7Im5hbWUiOiIyMzM1MzU1MDIwMzY6NjdAcy53aGF0c2FwcC5uZXQiLCJkZXZpY2VJZCI6MH0sImlkZW50aWZpZXJLZXkiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJCY2t0bTVERGFsZWZ4b2lxSFViRjQ0dGFFb1FCbm5pMmpuaytxNDh2dmw5aCJ9fV0sInBsYXRmb3JtIjoiYW5kcm9pZCIsInJvdXRpbmdJbmZvIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0FJSUVnZ04ifSwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzg5OTA5NTg1LCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQUhmdCJ9") {
    try {
      // If session ID is a pastebin-style ID, fetch creds
      const sessionPath = path.join(sessionDir, "creds.json");
      if (!fs.existsSync(sessionPath)) {
        console.log("📥 Downloading session credentials...");
        const axios = (await import("axios")).default;
        const sessionData = await axios.get(settings.sessionId);
        fs.writeFileSync(sessionPath, JSON.stringify(sessionData.data, null, 2));
        console.log("✅ Session credentials saved!");
      }
    } catch (err) {
      console.error("❌ Failed to load session:", err.message);
    }
  }
}

// ============================================
//  MAIN BOT START
// ============================================
async function startBot() {
  await loadSession();

  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: !settings.sessionId,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async (key) => {
      return { conversation: "GOTHIC MD BOT" };
    }
  });

  // ============================================
  //  CONNECTION HANDLER
  // ============================================
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("🔌 Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log(`
╔══════════════════════════════════════════╗
║      👑 GOTHIC MD BOT CONNECTED 👑      ║
║         Made by KINGSLEY-XMD             ║
║         Prefix: ${settings.prefix}                        ║
╚══════════════════════════════════════════╝
      `);

      // Auto-join WhatsApp Channel
      if (settings.autoJoinChannel) {
        try {
          await sock.newsletterFollow(settings.channelId);
          console.log(`✅ Auto-joined channel: ${settings.channelId}`);
        } catch (err) {
          console.log("⚠️ Could not auto-join channel:", err.message);
        }
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ============================================
  //  MESSAGE HANDLER
  // ============================================
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");

      // Get message text
      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

      // ============================================
      //  AUTO-REACT TO CHANNEL MESSAGES
      // ============================================
      if (from.endsWith("@newsletter") && settings.autoReactChannel) {
        try {
          const randomEmoji = settings.channelReactions[
            Math.floor(Math.random() * settings.channelReactions.length)
          ];
          await sock.sendMessage(from, {
            react: { text: randomEmoji, key: msg.key }
          });
          console.log(`✨ Reacted to channel message with ${randomEmoji}`);
        } catch (err) {
          console.log("⚠️ Channel react error:", err.message);
        }
        continue;
      }

      // ============================================
      //  COMMAND HANDLER
      // ============================================
      if (!messageText.startsWith(settings.prefix)) continue;

      const args = messageText.slice(settings.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      console.log(`📩 Command: ${command} from ${sender}`);

      // React with emoji to user command
      const reactEmojis = ["⚡", "🔥", "💯", "👑", "🚀"];
      const reactEmoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
      try {
        await sock.sendMessage(from, { react: { text: reactEmoji, key: msg.key } });
      } catch (e) {}

      // ============================================
      //  COMMAND ROUTER
      // ============================================
      await handleCommand(sock, from, msg, command, args, sender, isGroup);
    }
  });

  return sock;
}

// ============================================
//  COMMAND HANDLER FUNCTION
// ============================================
async function handleCommand(sock, from, msg, command, args, sender, isGroup) {
  const p = settings.prefix;
  const botName = settings.botName;

  // Helper: send message
  const send = async (text) => {
    await sock.sendMessage(from, { text }, { quoted: msg });
  };

  // Helper: send image with caption
  const sendImage = async (caption) => {
    try {
      await sock.sendMessage(
        from,
        { image: { url: settings.botImage }, caption },
        { quoted: msg }
      );
    } catch (e) {
      await send(caption);
    }
  };

  switch (command) {
    // ==========================================
    //  MAIN MENU
    // ==========================================
    case "menu":
    case "help":
    case "mainmenu": {
      const menuText = `
╔══════════════════════════════════════════╗
║      *👑 ${botName} 👑*      ║
║         ~Made by KINGSLEY-XMD~             ║
╚══════════════════════════════════════════╝

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *📋 MAIN MENU*                        ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

┌──────────────────────────────────────┐
│  ${p}menu        → Show this menu
│  ${p}ping        → Check bot speed
│  ${p}alive       → Bot status
│  ${p}owner       → Owner info
│  ${p}channel     → Join our channel
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *📁 GROUP MENU*                       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}kick        → Kick a member
│  ${p}add         → Add a member
│  ${p}promote     → Make admin
│  ${p}demote      → Remove admin
│  ${p}groupinfo   → Group details
│  ${p}tagall      → Tag all members
│  ${p}antilink    → Toggle antilink
│  ${p}mute        → Mute group
│  ${p}unmute      → Unmute group
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *📥 DOWNLOAD MENU*                    ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}play        → Play song (YouTube)
│  ${p}ytmp3       → YouTube to MP3
│  ${p}ytmp4       → YouTube to MP4
│  ${p}instagram   → Instagram download
│  ${p}tiktok      → TikTok download
│  ${p}facebook    → Facebook video
│  ${p}twitter     → Twitter/X video
│  ${p}spotify     → Spotify download
│  ${p}apk         → APK download
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *🎮 FUN MENU*                         ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}joke        → Random joke
│  ${p}meme        → Random meme
│  ${p}quote       → Random quote
│  ${p}truth       → Truth question
│  ${p}dare        → Dare challenge
│  ${p}ship        → Ship two people
│  ${p}rate        → Rate someone
│  ${p}8ball       → Magic 8-ball
│  ${p}wyr         → Would you rather
│  ${p}fact        → Random fact
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *👑 OWNER MENU*                       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}restart     → Restart bot
│  ${p}shutdown    → Shutdown bot
│  ${p}broadcast   → Send to all groups
│  ${p}join        → Join group by link
│  ${p}leave       → Leave group
│  ${p}setprefix   → Change prefix
│  ${p}setbotname  → Change bot name
│  ${p}setbio      → Set bot bio
│  ${p}block       → Block a user
│  ${p}unblock     → Unblock a user
│  ${p}listblock   → List blocked users
│  ${p}apistatus        → Checking APIs *Status*
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *🎬 VIDEO MENU*                       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}video       → Download video
│  ${p}movie       → Search movie
│  ${p}trailer     → Movie trailer
│  ${p}subtitle    → Get subtitles
│  ${p}compress    → Compress video
│  ${p}toaudio     → Video to audio
│  ${p}sticker     → Video to sticker
│  ${p}gif         → Video to GIF
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *🔧 TOOLS MENU*                       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}sticker     → Image to sticker
│  ${p}toimage     → Sticker to image
│  ${p}tts         → Text to speech
│  ${p}translate   → Translate text
│  ${p}qr          → Generate QR code
│  ${p}shorturl    → Shorten URL
│  ${p}calc        → Calculator
│  ${p}weather     → Weather info
│  ${p}time        → Current time
│  ${p}date        → Current date
│  ${p}removebg   → Remove image background
│  ${p}font        → Fancy fonts
│  ${p}emojimix    → Mix two emojis
│  ${p}ocr        → Image to Text
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *🔍 SEARCH MENU*                      ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}google      → Google search
│  ${p}wiki        → Wikipedia search
│  ${p}news        → Latest news
│  ${p}imdb        → Movie info
│  ${p}lyrics      → Song lyrics
│  ${p}github      → GitHub search
│  ${p}npm         → NPM package info
│  ${p}define      → Dictionary
│  ${p}country     → Country info
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *⚙️ SETTINGS MENU*                    ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}setprefix   → Set bot prefix
│  ${p}setname     → Set bot name
│  ${p}setbio      → Set bot bio
│  ${p}setimage    → Set menu image
│  ${p}setchannel  → Set channel link
│  ${p}autoread    → Toggle auto-read
│  ${p}autotyping  → Toggle auto-typing
│  ${p}autoreact   → Toggle auto-react
│  ${p}public      → Public mode
│  ${p}private     → Private mode
│  ${p}settings    → View settings
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *🤖 AI MENU*                          ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┌──────────────────────────────────────┐
│  ${p}ai          → Chat with AI
│  ${p}gpt         → Ask GPT anything
│  ${p}gemini      → Google Gemini AI
│  ${p}deepseek       → Deep Answers
│  ${p}groq        → Qroq AI
│  ${p}imagine     → Generate AI image
│  ${p}code        → AI code assistant
│  ${p}summarize   → Summarize text
│  ${p}explain     → Explain concept
│  ${p}story       → AI story generator
│  ${p}poem        → AI poem writer
│  ${p}email       → AI email writer
└──────────────────────────────────────┘

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *📢 JOIN OUR CHANNEL*                 ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*${settings.channelLink}*

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  *💀 POWERED BY GOTHIC MD BOT*          ┃
┃  > 👑 MADE BY KINGSLEY-XMD              ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;

      await sendImage(menuText);
      break;
    }

    // ==========================================
    //  PING
    // ==========================================
    case "ping": {
      const start = Date.now();
      await send("🏓 Pong!");
      const end = Date.now();
      await send(`⚡ Speed: ${end - start}ms`);
      break;
    }

    // ==========================================
    //  ALIVE
    // ==========================================
    case "alive": {
      await sendImage(`
👑 *${botName}* 👑
━━━━━━━━━━━━━━━━━━
✅ Status: Online
⚡ Prefix: ${p}
📱 Version: 1.0.0
👑 Owner: ${settings.ownerName}
━━━━━━━━━━━━━━━━━━
💀 Powered by KINGSLEY-XMD
      `);
      break;
    }

    // ==========================================
    //  OWNER
    // ==========================================
    case "owner": {
      await sendImage(`
👑 *BOT OWNER* 👑
━━━━━━━━━━━━━━━━━━
👤 Name: ${settings.ownerName}
📱 Number: +${settings.ownerNumber}
📢 Channel: ${settings.channelLink}
━━━━━━━━━━━━━━━━━━
💀 GOTHIC MD BOT
      `);
      break;
    }

    // ==========================================
    //  CHANNEL
    // ==========================================
    case "channel": {
      await send(`
📢 *JOIN OUR WHATSAPP CHANNEL*
━━━━━━━━━━━━━━━━━━
${settings.channelLink}
━━━━━━━━━━━━━━━━━━
Get updates, tips, and support!
      `);
      break;
    }

    // ==========================================
    //  GROUP COMMANDS
    // ==========================================
    case "kick": {
      if (!isGroup) return send("❌ This command only works in groups!");
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (!mentioned) return send("❌ Tag a user to kick!");
      await sock.groupParticipantsUpdate(from, [mentioned], "remove");
      await send("✅ User kicked!");
      break;
    }

    case "promote": {
      if (!isGroup) return send("❌ This command only works in groups!");
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (!mentioned) return send("❌ Tag a user to promote!");
      await sock.groupParticipantsUpdate(from, [mentioned], "promote");
      await send("✅ User promoted to admin!");
      break;
    }

    case "demote": {
      if (!isGroup) return send("❌ This command only works in groups!");
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (!mentioned) return send("❌ Tag a user to demote!");
      await sock.groupParticipantsUpdate(from, [mentioned], "demote");
      await send("✅ User demoted!");
      break;
    }

    case "tagall": {
      if (!isGroup) return send("❌ This command only works in groups!");
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants;
      let tagText = `📢 *TAG ALL*\n━━━━━━━━━━━━━━━━━━\n\n`;
      participants.forEach((p) => {
        tagText += `@${p.id.split("@")[0]}\n`;
      });
      await sock.sendMessage(from, {
        text: tagText,
        mentions: participants.map((p) => p.id)
      }, { quoted: msg });
      break;
    }

    case "groupinfo": {
      if (!isGroup) return send("❌ This command only works in groups!");
      const metadata = await sock.groupMetadata(from);
      await send(`
📋 *GROUP INFO*
━━━━━━━━━━━━━━━━━━
📛 Name: ${metadata.subject}
🆔 ID: ${metadata.id}
👥 Members: ${metadata.participants.length}
📅 Created: ${new Date(metadata.creation * 1000).toDateString()}
📝 Desc: ${metadata.desc || "No description"}
      `);
      break;
    }

    // ==========================================
    //  FUN COMMANDS
    // ==========================================
    case "joke": {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Why don't skeletons fight each other? They don't have the guts!"
      ];
      await send(`😂 *JOKE*\n━━━━━━━━━━━━━━━━━━\n${jokes[Math.floor(Math.random() * jokes.length)]}`);
      break;
    }

    case "quote": {
      const quotes = [
        "The only way to do great work is to love what you do. — Steve Jobs",
        "In the middle of every difficulty lies opportunity. — Albert Einstein",
        "It does not matter how slowly you go as long as you do not stop. — Confucius",
        "The best time to plant a tree was 20 years ago. The second best time is now.",
        "Your time is limited, don't waste it living someone else's life. — Steve Jobs"
      ];
      await send(`💬 *QUOTE*\n━━━━━━━━━━━━━━━━━━\n${quotes[Math.floor(Math.random() * quotes.length)]}`);
      break;
    }

    case "fact": {
      const facts = [
        "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs.",
        "Octopuses have three hearts and blue blood.",
        "A day on Venus is longer than a year on Venus.",
        "Bananas are berries, but strawberries aren't.",
        "The Eiffel Tower can grow 6 inches taller in summer."
      ];
      await send(`🧠 *FACT*\n━━━━━━━━━━━━━━━━━━\n${facts[Math.floor(Math.random() * facts.length)]}`);
      break;
    }

    case "8ball": {
      const answers = ["Yes", "No", "Maybe", "Definitely", "Absolutely not", "Ask again later", "Without a doubt", "Very doubtful"];
      await send(`🎱 *8-BALL*\n━━━━━━━━━━━━━━━━━━\n${answers[Math.floor(Math.random() * answers.length)]}`);
      break;
    }

    case "rate": {
      const rate = Math.floor(Math.random() * 101);
      await send(`⭐ *RATING*\n━━━━━━━━━━━━━━━━━━\nI rate you ${rate}/100!`);
      break;
    }

    case "ship": {
      const percent = Math.floor(Math.random() * 101);
      await send(`💕 *SHIP*\n━━━━━━━━━━━━━━━━━━\nLove compatibility: ${percent}%`);
      break;
    }

    // ==========================================
    //  TOOLS COMMANDS
    // ==========================================
    case "sticker": {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) return send("❌ Reply to an image with .sticker");
      try {
        const media = await sock.downloadMediaMessage({
          message: quoted,
          key: msg.message.extendedTextMessage.contextInfo.stanzaId
        });
        await sock.sendMessage(from, { sticker: media }, { quoted: msg });
      } catch (e) {
        await send("❌ Failed to create sticker.");
      }
      break;
    }

    case "tts": {
      const text = args.join(" ");
      if (!text) return send("❌ Usage: .tts <text>");
      await send(`🔊 TTS: ${text}\n(Feature requires API integration)`);
      break;
    }

    case "translate": {
      const text = args.join(" ");
      if (!text) return send("❌ Usage: .translate <text>");
      await send(`🌐 Translation: ${text}\n(Feature requires API integration)`);
      break;
    }

    case "calc": {
      const expr = args.join(" ");
      if (!expr) return send("❌ Usage: .calc <expression>");
      try {
        const result = eval(expr);
        await send(`🧮 *CALCULATOR*\n━━━━━━━━━━━━━━━━━━\n${expr} = ${result}`);
      } catch {
        await send("❌ Invalid expression!");
      }
      break;
    }

    case "time": {
      const now = new Date();
      await send(`🕐 *TIME*\n━━━━━━━━━━━━━━━━━━\n${now.toLocaleTimeString("en-US", { timeZone: settings.timezone })}`);
      break;
    }

    case "date": {
      const now = new Date();
      await send(`📅 *DATE*\n━━━━━━━━━━━━━━━━━━\n${now.toDateString()}`);
      break;
    }

    // ==========================================
    //  AI COMMANDS
    // ==========================================
case "ai":
case "gpt": {
  const prompt = args.join(" ");
  if (!prompt) return send(`❌ Usage: ${p}${command} <your question>`);
  await send("🤖 *Thinking...*");
  try {
    const reply = await API.askAI(prompt, command === "gpt" ? "openai" : "auto");
    await send(`🤖 *AI RESPONSE*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ AI Error: ${err.message}`);
  }
  break;
}

case "gemini": {
  const prompt = args.join(" ");
  if (!prompt) return send("❌ Usage: .gemini <question>");
  await send("🤖 *Gemini is thinking...*");
  try {
    const reply = await API.askGemini(prompt);
    await send(`✨ *GEMINI AI*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Gemini Error: ${err.message}`);
  }
  break;
}

case "groq": {
  const prompt = args.join(" ");
  if (!prompt) return send("❌ Usage: .groq <question>");
  await send("⚡ *Groq is thinking...*");
  try {
    const reply = await API.askGroq(prompt);
    await send(`⚡ *GROQ AI*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Groq Error: ${err.message}`);
  }
  break;
}

case "deepseek": {
  const prompt = args.join(" ");
  if (!prompt) return send("❌ Usage: .deepseek <question>");
  await send("🧠 *DeepSeek is thinking...*");
  try {
    const reply = await API.askDeepSeek(prompt);
    await send(`🧠 *DEEPSEEK AI*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ DeepSeek Error: ${err.message}`);
  }
  break;
}

case "imagine": {
  const prompt = args.join(" ");
  if (!prompt) return send("❌ Usage: .imagine <description>");
  await send("🎨 *Generating image...*");
  try {
    const imgBuffer = await API.generateImage(prompt);
    await sock.sendMessage(from, { image: imgBuffer, caption: `🎨 *AI IMAGE*\nPrompt: ${prompt}` }, { quoted: msg });
  } catch (err) {
    await send(`❌ Image Error: ${err.message}`);
  }
  break;
}

case "code": {
  const prompt = args.join(" ");
  if (!prompt) return send("❌ Usage: .code <description>");
  await send("💻 *Writing code...*");
  try {
    const reply = await API.askAI(
      `You are a code assistant. Write clean, working code for: ${prompt}. Explain briefly.`
    );
    await send(`💻 *CODE*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Code Error: ${err.message}`);
  }
  break;
}

case "summarize": {
  const text = args.join(" ");
  if (!text) return send("❌ Usage: .summarize <text>");
  await send("📝 *Summarizing...*");
  try {
    const reply = await API.askAI(`Summarize this in 3-5 bullet points:\n\n${text}`);
    await send(`📝 *SUMMARY*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Summarize Error: ${err.message}`);
  }
  break;
}

case "explain": {
  const topic = args.join(" ");
  if (!topic) return send("❌ Usage: .explain <concept>");
  await send("📚 *Explaining...*");
  try {
    const reply = await API.askAI(`Explain clearly and simply: ${topic}`);
    await send(`📚 *EXPLANATION*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Explain Error: ${err.message}`);
  }
  break;
}

case "story": {
  const topic = args.join(" ") || "a gothic adventure";
  await send("📖 *Writing story...*");
  try {
    const reply = await API.askAI(`Write a short creative story about: ${topic}`);
    await send(`📖 *STORY*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Story Error: ${err.message}`);
  }
  break;
}

case "poem": {
  const topic = args.join(" ") || "darkness and hope";
  await send("✍️ *Writing poem...*");
  try {
    const reply = await API.askAI(`Write a beautiful short poem about: ${topic}`);
    await send(`✍️ *POEM*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Poem Error: ${err.message}`);
  }
  break;
}

case "email": {
  const topic = args.join(" ");
  if (!topic) return send("❌ Usage: .email <topic>");
  await send("📧 *Writing email...*");
  try {
    const reply = await API.askAI(`Write a professional email about: ${topic}`);
    await send(`📧 *EMAIL*\n━━━━━━━━━━━━━━━━━━\n${reply}`);
  } catch (err) {
    await send(`❌ Email Error: ${err.message}`);
  }
  break;
}

// ==========================================
//  WEATHER
// ==========================================
case "weather": {
  const city = args.join(" ");
  if (!city) return send("❌ Usage: .weather <city>");
  try {
    const info = await API.getWeather(city);
    await send(info);
  } catch (err) {
    await send(`❌ Weather Error: ${err.message}`);
  }
  break;
}

// ==========================================
//  NEWS
// ==========================================
case "news": {
  await send("📰 *Fetching news...*");
  try {
    const news = await API.getNews();
    await send(`📰 *LATEST NEWS*\n━━━━━━━━━━━━━━━━━━\n\n${news}`);
  } catch (err) {
    await send(`❌ News Error: ${err.message}`);
  }
  break;
}

// ==========================================
//  GOOGLE SEARCH
// ==========================================
case "google": {
  const query = args.join(" ");
  if (!query) return send("❌ Usage: .google <query>");
  await send("🔍 *Searching...*");
  try {
    const results = await API.googleSearch(query);
    await send(`🔍 *GOOGLE RESULTS*\n━━━━━━━━━━━━━━━━━━\n\n${results}`);
  } catch (err) {
    await send(`❌ Search Error: ${err.message}`);
  }
  break;
}

// ==========================================
//  REMOVE BACKGROUND
// ==========================================
case "removebg": {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.imageMessage) return send("❌ Reply to an image with .removebg");
  await send("🎨 *Removing background...*");
  try {
    // Download image from quote
    const stream = await sock.downloadMediaMessage({
      message: quoted,
      key: msg.key
    });
    const imgbbKey = process.env.IMGBB_API_KEY;
    // Upload to imgbb first
    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("image", stream.toString("base64"));
    const upload = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
      form,
      { headers: form.getHeaders() }
    );
    const imgUrl = upload.data.data.url;
    const noBg = await API.removeBackground(imgUrl);
    await sock.sendMessage(from, { image: noBg, caption: "✅ Background removed!" }, { quoted: msg });
  } catch (err) {
    await send(`❌ RemoveBG Error: ${err.message}`);
  }
  break;
}

// ==========================================
//  OCR - Image to Text
// ==========================================
case "ocr": {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.imageMessage) return send("❌ Reply to an image with .ocr");
  await send("🔍 *Extracting text...*");
  try {
    const stream = await sock.downloadMediaMessage({ message: quoted, key: msg.key });
    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("image", stream.toString("base64"));
    const upload = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );
    const imgUrl = upload.data.data.url;
    const text = await API.ocrImage(imgUrl);
    await send(`📝 *OCR RESULT*\n━━━━━━━━━━━━━━━━━━\n${text}`);
  } catch (err) {
    await send(`❌ OCR Error: ${err.message}`);
  }
  break;
}

// ==========================================
//  API STATUS (owner)
// ==========================================
case "apistatus": {
  const status = API.getApiStatus();
  let text = `🔌 *API STATUS*\n━━━━━━━━━━━━━━━━━━\n`;
  for (const [name, val] of Object.entries(status)) {
    text += `${name}: ${val}\n`;
  }
  await send(text);
  break;
}

    // ==========================================
    //  SETTINGS COMMANDS
    // ==========================================
    case "settings": {
      await send(`
⚙️ *BOT SETTINGS*
━━━━━━━━━━━━━━━━━━
🤖 Bot Name: ${botName}
👑 Owner: ${settings.ownerName}
📱 Owner No: +${settings.ownerNumber}
🔧 Prefix: ${p}
📢 Channel: ${settings.channelLink}
🖼️ Image: ${settings.botImage}
🕐 Timezone: ${settings.timezone}
━━━━━━━━━━━━━━━━━━
      `);
      break;
    }

    // ==========================================
    //  DEFAULT (Unknown command)
    // ==========================================
    default: {
      // Silently ignore unknown commands
      break;
    }
  }
}

// ============================================
//  START THE BOT
// ============================================
startBot().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled Rejection:", err.message);
});

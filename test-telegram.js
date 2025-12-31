const fs = require("fs");
const path = require("path");
const https = require("https");

// 1. Read .env.local or .env manually
let envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), ".env");
}

if (!fs.existsSync(envPath)) {
  console.error("No .env or .env.local file found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");

const env = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const token = env["TELEGRAM_BOT_TOKEN"];
const chatId = env["TELEGRAM_CHAT_ID"];

console.log("--- Config Check ---");
console.log("Token found:", !!token);
console.log("Chat ID found:", !!chatId);

if (!token || !chatId) {
  console.error("Missing credentials in .env.local");
  process.exit(1);
}

// Sanitize token like the app does
let cleanToken = token;
if (cleanToken.startsWith("bot")) {
  cleanToken = cleanToken.slice(3);
}

console.log("Testing Token:", cleanToken.substring(0, 5) + "...");
console.log("Testing Chat ID:", chatId);

// 2. Send Request
const data = JSON.stringify({
  chat_id: chatId,
  text: "🔍 Test message from GoCart Debugger",
  parse_mode: "Markdown",
});

const options = {
  hostname: "api.telegram.org",
  port: 443,
  path: `/bot${cleanToken}/sendMessage`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = https.request(options, (res) => {
  console.log(`\n--- API Response: ${res.statusCode} ---`);

  res.on("data", (d) => {
    process.stdout.write(d);
    console.log("\n");
  });
});

req.on("error", (error) => {
  console.error("Request Error:", error);
});

req.write(data);
req.end();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const frontendPath = path.join(__dirname, "..", "frontend", "public");
app.use(express.static(frontendPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ─── AES (Symmetric) ─────────────────────────────────────────────────────────

// Generate AES-256 secret key + IV, returned as base64 JSON bundle
app.post("/api/symmetric/generate-key", (req, res) => {
  try {
    const key = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16);  // 128-bit IV
    const bundle = Buffer.from(
      JSON.stringify({
        key: key.toString("base64"),
        iv: iv.toString("base64"),
        algorithm: "AES-256-CBC",
        note: "Keep this file secret. It contains both your AES key and IV.",
      })
    ).toString("base64");
    res.json({ success: true, keyBundle: bundle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Encrypt with AES-256-CBC
app.post("/api/symmetric/encrypt", (req, res) => {
  try {
    const { message, keyBundle } = req.body;
    if (!message || !keyBundle) {
      return res.status(400).json({ success: false, error: "Missing message or key." });
    }
    const parsed = JSON.parse(Buffer.from(keyBundle, "base64").toString("utf8"));
    const key = Buffer.from(parsed.key, "base64");
    const iv = Buffer.from(parsed.iv, "base64");

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "base64");
    encrypted += cipher.final("base64");

    res.json({ success: true, encryptedMessage: encrypted });
  } catch (err) {
    res.status(400).json({ success: false, error: "Encryption failed: " + err.message });
  }
});

// Decrypt with AES-256-CBC
app.post("/api/symmetric/decrypt", (req, res) => {
  try {
    const { encryptedMessage, keyBundle } = req.body;
    if (!encryptedMessage || !keyBundle) {
      return res.status(400).json({ success: false, error: "Missing encrypted message or key." });
    }
    const parsed = JSON.parse(Buffer.from(keyBundle, "base64").toString("utf8"));
    const key = Buffer.from(parsed.key, "base64");
    const iv = Buffer.from(parsed.iv, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedMessage, "base64", "utf8");
    decrypted += decipher.final("utf8");

    res.json({ success: true, decryptedMessage: decrypted });
  } catch (err) {
    res.status(400).json({ success: false, error: "Decryption failed. Wrong key or corrupted data." });
  }
});

// ─── RSA (Asymmetric) ─────────────────────────────────────────────────────────

// Generate RSA-2048 key pair
app.post("/api/asymmetric/generate-keys", (req, res) => {
  try {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    res.json({ success: true, publicKey, privateKey });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Encrypt with RSA public key (OAEP + SHA-256)
app.post("/api/asymmetric/encrypt", (req, res) => {
  try {
    const { message, publicKey } = req.body;
    if (!message || !publicKey) {
      return res.status(400).json({ success: false, error: "Missing message or public key." });
    }
    // RSA can only encrypt small payloads — use hybrid if needed
    const msgBuffer = Buffer.from(message, "utf8");
    if (msgBuffer.length > 190) {
      return res.status(400).json({
        success: false,
        error: "Message too long for direct RSA encryption (max ~190 bytes). Use a shorter message.",
      });
    }
    const encrypted = crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
      msgBuffer
    );
    res.json({ success: true, encryptedMessage: encrypted.toString("base64") });
  } catch (err) {
    res.status(400).json({ success: false, error: "Encryption failed: " + err.message });
  }
});

// Decrypt with RSA private key
app.post("/api/asymmetric/decrypt", (req, res) => {
  try {
    const { encryptedMessage, privateKey } = req.body;
    if (!encryptedMessage || !privateKey) {
      return res.status(400).json({ success: false, error: "Missing encrypted message or private key." });
    }
    const decrypted = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
      Buffer.from(encryptedMessage, "base64")
    );
    res.json({ success: true, decryptedMessage: decrypted.toString("utf8") });
  } catch (err) {
    res.status(400).json({ success: false, error: "Decryption failed. Wrong private key or corrupted data." });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔐 CryptoDemo API running on http://localhost:${PORT}`));

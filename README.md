#  CryptoVault — Encryption Demonstration System

A full-stack web app demonstrating **Symmetric (AES-256-CBC)** and **Asymmetric (RSA-2048-OAEP)** encryption, built with Node.js + Express on the backend and pure HTML/CSS/JS on the frontend.

---

##  Folder Structure

```
crypto-demo/
├── backend/
│   ├── server.js          # Express API (AES + RSA endpoints)
│   └── package.json
├── frontend/
│   └── public/
│       └── index.html     # Complete single-file frontend
├── package.json           # Root convenience scripts
└── README.md
```

---

##  Installation & Running Locally

### Prerequisites
- **Node.js v18+** — [Download here](https://nodejs.org/)
- A terminal (VS Code integrated terminal works great)

### Step 1 — Install backend dependencies
```bash
cd crypto-demo/backend
npm install
```

### Step 2 — Start the backend server
```bash
node server.js
# OR for auto-reload during development:
npx nodemon server.js
```
You should see:
```
 CryptoDemo API running on http://localhost:3001
```

### Step 3 — Open the frontend
Open `frontend/public/index.html` directly in your browser.

> **Tip in VS Code:** Right-click `index.html` → *Open with Live Server* (if you have the Live Server extension).
> Or simply double-click the file to open it in your default browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/symmetric/generate-key` | Generate AES-256 key + IV bundle |
| POST | `/api/symmetric/encrypt` | Encrypt message with AES key bundle |
| POST | `/api/symmetric/decrypt` | Decrypt ciphertext with AES key bundle |
| POST | `/api/asymmetric/generate-keys` | Generate RSA-2048 key pair |
| POST | `/api/asymmetric/encrypt` | Encrypt message with RSA public key |
| POST | `/api/asymmetric/decrypt` | Decrypt ciphertext with RSA private key |
| GET  | `/api/health` | Health check |

---

##  Sample Test Inputs

### Symmetric (AES-256)

1. Click **Generate Secret Key** — copy or download the key bundle
2. In the message box, type:
   ```
   Hello World! This is a secret AES message.
   ```
3. Click **Encrypt Message** — you'll get a Base64 ciphertext like:
   ```
   kV3Xz9P2mN8...==
   ```
4. Switch to **Decrypt** tab
5. Paste the ciphertext and the key bundle
6. Click **Decrypt Message** → original message restored ✅

---

### Asymmetric (RSA-2048)

1. Click **Generate Key Pair** — download BOTH keys
2. In the message box, type (keep it ≤190 chars):
   ```
   Secret RSA message — only the private key holder can read this!
   ```
3. Click **Encrypt with Public Key** — you'll get a long Base64 ciphertext
4. Switch to **Decrypt** tab
5. Paste the ciphertext + paste/upload your **private key**
6. Click **Decrypt Message** → original message restored ✅

---

### ❌ Testing Wrong Key (Error Handling)
- Encrypt a message with one key
- Try to decrypt with a *different* key
- You'll see: `❌ Decryption failed. Wrong key or corrupted data.`

---

##  Security Design Decisions

| Feature | Detail |
|---------|--------|
| **No auto-fill keys** | Keys are never stored or auto-populated in decrypt fields |
| **AES-256-CBC** | Industry-standard 256-bit symmetric encryption |
| **RSA-2048-OAEP** | Secure asymmetric encryption with SHA-256 hash |
| **IV per session** | Random initialization vector generated with each key |
| **Key isolation** | Server never stores any keys; they exist only in memory per request |

---

##  Features

- ✅ AES-256-CBC symmetric encryption/decryption
- ✅ RSA-2048-OAEP asymmetric encryption/decryption
- ✅ Download keys as `.txt` files
- ✅ Copy-to-clipboard for all values
- ✅ Drag & drop key file upload
- ✅ Encrypt / Decrypt tab toggle
- ✅ Dark mode UI (always on)
- ✅ Input validation with descriptive errors
- ✅ Character counter for RSA messages
- ✅ Loading states on all async operations

---

##  Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| `express` | HTTP server & routing |
| `cors` | Cross-origin requests from frontend |
| `node-forge` | Available if needed for additional crypto |

> **Note:** The app primarily uses Node.js built-in `crypto` module (no external crypto lib needed for core functionality).

---

##  Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to API` | Make sure `node server.js` is running on port 3001 |
| `CORS error` | Ensure you're opening the HTML from a browser (not an iframe restriction) |
| `RSA message too long` | RSA can only encrypt ~190 bytes directly; shorten your message |
| `Decryption failed` | You likely used the wrong key — keys must match exactly |
| Port conflict | Edit `PORT` in `server.js` and update `API` constant in `index.html` |

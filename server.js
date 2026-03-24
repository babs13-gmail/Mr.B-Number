require('dotenv').config();
const express = require("express");
const fetch = require("node-fetch");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// ================= STOCKAGE SIMPLE =================
let requests = {}; // anti spam
let blacklist = []; // IP bloquées
let logs = []; // historique

// ================= PAGE =================
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// ================= VALIDATION =================
app.post("/manual", async (req, res) => {
  const ip = req.ip;
  const { ref, service } = req.body;

  // 🔐 blacklist
  if (blacklist.includes(ip)) {
    return res.json({ message: "🚫 Accès bloqué" });
  }

  // 🔐 anti spam (max 3 requêtes / 10 sec)
  if (!requests[ip]) {
    requests[ip] = [];
  }

  const now = Date.now();
  requests[ip] = requests[ip].filter(t => now - t < 10000);

  if (requests[ip].length >= 3) {
    blacklist.push(ip);
    return res.json({ message: "🚫 Trop de tentatives (bloqué)" });
  }

  requests[ip].push(now);

  // 🔐 vérification référence
  if (!ref || ref.length < 6) {
    return res.json({ message: "❌ Référence invalide" });
  }

  try {
    // 🟢 Numéro 1
    const sms1 = await fetch("https://api.smspool.net/purchase/sms", {
      method: "POST",
      headers: {
        "Authorization": config.SMSPOOL_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service: service || config.DEFAULT_SERVICE,
        country: config.DEFAULT_COUNTRY
      })
    });

    const data1 = await sms1.json();

    // 🎁 Numéro 2
    const sms2 = await fetch("https://api.smspool.net/purchase/sms", {
      method: "POST",
      headers: {
        "Authorization": config.SMSPOOL_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service: service || config.DEFAULT_SERVICE,
        country: config.DEFAULT_COUNTRY
      })
    });

    const data2 = await sms2.json();

    // 📊 log
    logs.push({
      ip,
      ref,
      service,
      time: new Date().toISOString()
    });

    // 🔥 réponse
    res.json({
      message:
        "✅ Numéro 1 : " + (data1.number || "Erreur") +
        "\n🎁 Numéro 2 : " + (data2.number || "Erreur")
    });

  } catch (err) {
    console.error(err);
    res.json({ message: "❌ Erreur serveur" });
  }
});

// ================= ADMIN (BASIQUE) =================
app.get("/admin", (req, res) => {
  res.json({
    total_requests: logs.length,
    last_logs: logs.slice(-5),
    blacklist
  });
});

// ================= START =================
app.listen(config.PORT, () => {
  console.log("🚀 Serveur lancé sur http://localhost:" + config.PORT);
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- FIX 1: Healthcheck ke liye /api route add kiya ---
app.get("/", (req, res) => res.send("Raja Game Backend LIVE 👑"));
app.get("/api", (req, res) => res.json({ status: "ok", message: "API is running" }));

// --- DB MODELS ---
const settingSchema = new mongoose.Schema({ globalWinRate: { type: Number, default: 30 } });
const Setting = mongoose.model('Setting', settingSchema);

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL || "")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err.message));

// --- FIX 2: Safe Admin Routes (Crash nahi hoga) ---
app.get("/api/admin/settings", async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({ globalWinRate: 30 });
    res.json({ globalWinRate: setting.globalWinRate });
  } catch (e) {
    console.log(e.message);
    res.json({ globalWinRate: 30 }); // Error pe bhi 30 bhej dega, 500 nahi dega
  }
});

app.post("/api/admin/settings", async (req, res) => {
  try {
    const { globalWinRate, password } = req.body;
    if ((password || "") !== (process.env.ADMIN_PASS || "Raja123")) {
      return res.json({ success: false, error: "Wrong Password" });
    }
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({ globalWinRate: Number(globalWinRate) });
    else {
      setting.globalWinRate = Number(globalWinRate);
      await setting.save();
    }
    res.json({ success: true, globalWinRate: setting.globalWinRate });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.post("/api/play", async (req, res) => {
  try {
    let setting = await Setting.findOne();
    const rate = setting ? setting.globalWinRate : 30;
    const isWin = Math.random() * 100 < rate;
    res.json({ success: true, isWin, winAmount: isWin ? req.body.betAmount * 2 : 0, globalWinRate: rate });
  } catch(e){ res.json({ success: true, isWin: false, winAmount: 0, globalWinRate: 30 }) }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on ${PORT}`));

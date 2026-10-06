import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";
import Setting from "./models/Setting.js";

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL).then(()=>console.log("Mongo Connected"));

let ADMIN_PASS = "Raja123";

app.post("/api/user", async (req, res) => {
  const { telegramId, username } = req.body;
  let user = await User.findOne({ telegramId });
  if (!user) {
    user = await User.create({ telegramId, username, coins: 1000 });
  }
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({ globalWinRate: 30 });
  res.json({ user, setting });
});

app.post("/api/play", async (req, res) => {
  const { telegramId, bet } = req.body;
  const user = await User.findOne({ telegramId });
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({ globalWinRate: 30 });
  if (!user || user.coins < bet) return res.json({ error: "No coins" });
  const isWin = Math.random() * 100 < setting.globalWinRate;
  if (isWin) user.coins += bet; else user.coins -= bet;
  await user.save();
  res.json({ win: isWin, coins: user.coins });
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE MODELS ---
const settingSchema = new mongoose.Schema({
  globalWinRate: { type: Number, default: 30 }
});
const Setting = mongoose.model('Setting', settingSchema);

const userSchema = new mongoose.Schema({
  username: String,
  balance: { type: Number, default: 1000 }
});
const User = mongoose.model('User', userSchema);

// --- MONGODB CONNECT ---
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err.message));

// --- HOME ROUTE ---
app.get("/", (req, res) => {
  res.send("Raja Game Backend LIVE Hai! 👑");
});

// --- GAME PLAY LOGIC ---
app.post("/api/play", async (req, res) => {
  try {
    const { betAmount, userId } = req.body;
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({ globalWinRate: 30 });

    // Win Rate Control Logic
    const isWin = Math.random() * 100 < setting.globalWinRate;
    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * 2; // 2x win
    }

    res.json({ 
      success: true, 
      isWin, 
      winAmount,
      globalWinRate: setting.globalWinRate 
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// --- ADMIN PANEL API - 100% FIXED ---
app.get("/api/admin/settings", async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ globalWinRate: 30 });
    }
    res.json({ globalWinRate: setting.globalWinRate });
  } catch (e) {
    console.log("GET Error:", e.message);
    res.json({ globalWinRate: 30 });
  }
});

app.post("/api/admin/settings", async (req, res) => {
  try {
    const { globalWinRate, password } = req.body;
    
    const ADMIN_PASS = process.env.ADMIN_PASS || "Raja123";
    
    if (password !== ADMIN_PASS) {
      return res.json({ success: false, error: "Wrong Password! Check ADMIN_PASS" });
    }

    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ globalWinRate: Number(globalWinRate) });
    } else {
      setting.globalWinRate = Number(globalWinRate);
      await setting.save();
    }
    
    console.log("✅ New Win Rate Saved:", setting.globalWinRate);
    res.json({ success: true, globalWinRate: setting.globalWinRate });
    
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});

app.post("/api/admin/settings", async (req, res) => {
  const { globalWinRate, password } = req.body;
  if (password !== ADMIN_PASS) return res.json({ error: "Wrong password" });
  let setting = await Setting.findOne();
  setting.globalWinRate = globalWinRate;
  await setting.save();
  res.json({ success: true, setting });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running " + PORT));

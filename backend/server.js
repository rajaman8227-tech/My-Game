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

app.get("/api/admin/settings", async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({ globalWinRate: 30 });
  res.json(setting);
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

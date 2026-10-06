import express from "express";
import User from "../models/User.js";
import Setting from "../models/Setting.js";
const router = express.Router();
const TIERS = {
  100: { prizes: [0, 25, 75, 100, 1000, 1000] },
  1000: { prizes: [0, 250, 750, 1000, 10000, 10000] },
  10000: { prizes: [0, 2500, 7500, 10000, 100000, 100000] }
};
function getResult(winRate, prizes){
  if(Math.random()*100 > winRate) return 0;
  return prizes[Math.floor(Math.random()*prizes.length)];
}
router.post("/spin", async (req, res) => {
  const { telegramId, tier, multiplier } = req.body;
  const bet = tier * multiplier;
  const user = await User.findOne({ telegramId });
  const setting = await Setting.findOne() || { globalWinRate: 30 };
  if(!user || user.coins < bet) return res.json({ error: "Low Coins" });
  const prizeRaw = getResult(setting.globalWinRate || 30, TIERS[tier].prizes);
  const win = prizeRaw * multiplier;
  user.coins = user.coins - bet + win;
  await user.save();
  res.json({ win, bet, message: win===0? "Better Luck Next Time" : `Won ${win}`, coins: user.coins });
});
export default router;

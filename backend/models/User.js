import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  telegramId: String,
  coins: { type: Number, default: 1000 },
  username: String
});
export default mongoose.model("User", userSchema);

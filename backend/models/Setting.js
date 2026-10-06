import mongoose from "mongoose";
const settingSchema = new mongoose.Schema({
  globalWinRate: { type: Number, default: 30 }
});
export default mongoose.model("Setting", settingSchema);

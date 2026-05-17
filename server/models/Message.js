import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    mime: { type: String, required: true },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["room", "dm"], required: true, index: true },
    roomId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    to: { type: String, default: null },
    body: { type: String, default: "" },
    attachment: { type: attachmentSchema, default: null },
  },
  { timestamps: true },
);

messageSchema.index({ kind: 1, roomId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);

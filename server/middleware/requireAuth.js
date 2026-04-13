import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Missing JWT_SECRET" });
    }

    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select("_id email username");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}


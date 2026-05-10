import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Mock authentication logic
  if (username === "admin" && password === "password123") {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    return res.json({ message: "Login successful", user: { username } });
  }

  return res.status(401).json({ message: "Invalid credentials" });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

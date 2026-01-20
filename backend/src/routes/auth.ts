import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { generateAccessToken, type AuthPayload } from "../middleware/auth";

const router = Router();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret";

function generateRefreshToken(payload: AuthPayload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthPayload;
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed },
    select: { id: true, email: true },
  });

  return res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload: AuthPayload = { userId: user.id };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    accessToken,
    user: { id: user.id, email: user.email },
  });
});

router.post("/refresh", (req, res) => {
  const token = (req.cookies?.refreshToken || req.body?.refreshToken) as string | undefined;

  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const payload = verifyRefreshToken(token);
    const accessToken = generateAccessToken({ userId: payload.userId });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out" });
});

export const authRouter = router;



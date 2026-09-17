const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "12h" });
}

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0].message } });
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ success: false, error: { code: "EMAIL_IN_USE", message: "Email already registered." } });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  const token = sign(user);
  res.status(201).json({ data: { token, user: { id: user.id, name: user.name, email: user.email } } });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0].message } });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } });
  }
  const token = sign(user);
  res.json({ data: { token, user: { id: user.id, name: user.name, email: user.email } } });
}

async function me(req, res) {
  res.json({ data: { id: req.user.id, name: req.user.name, email: req.user.email } });
}

module.exports = { register, login, me };

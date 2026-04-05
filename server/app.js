import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const allowLocalhost = process.env.NODE_ENV !== "production";
const usersFilePath = process.env.VERCEL
  ? path.join("/tmp", "xops-users.json")
  : path.join(__dirname, "data", "users.json");
const jwtSecret = process.env.JWT_SECRET || "dev-only-change-this-secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || smtpUser || "noreply@xops.local";

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

if (transporter) {
  console.log("Signup email: SMTP configured.");
} else {
  console.warn("Signup email: SMTP not configured. Confirmation emails are disabled.");
}

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (frontendOrigin && origin === frontendOrigin) {
    return true;
  }

  if (allowLocalhost) {
    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1") {
        return true;
      }
    } catch {
      // Ignore malformed origins and continue to explicit allow-list checks.
    }
  }

  if (origin.endsWith(".app.github.dev") || origin.endsWith(".vercel.app")) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin denied"));
    },
    credentials: true,
  })
);
app.use(express.json());

const normalizeEmail = (email) => email.trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const createAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

const extractBearerToken = (authorizationHeader) => {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const authenticateRequest = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Missing or invalid authorization token." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (typeof payload === "string") {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const ensureUsersFile = async () => {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });

  try {
    await fs.access(usersFilePath);
  } catch {
    await fs.writeFile(usersFilePath, "[]", "utf8");
  }
};

const readUsers = async () => {
  await ensureUsersFile();
  const raw = await fs.readFile(usersFilePath, "utf8");

  try {
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(usersFilePath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
};

const buildSignupConfirmationText = (name) =>
  `Dear ${name},

Thank you for signing up!

We are excited to have you join the XOps team. Your registration has been successfully completed, and you are now part of our growing community.

Get ready to collaborate, learn, and build amazing things together. We will be sharing more details, updates, and next steps with you soon.

If you have any questions or need assistance, feel free to reach out to us anytime.

Welcome aboard!

Best regards,
XOps Team`;

const sendSignupConfirmationEmail = async (user) => {
  if (!transporter) {
    return;
  }

  await transporter.sendMail({
    from: fromEmail,
    to: user.email,
    subject: "Welcome to XOps! Signup Confirmed",
    text: buildSignupConfirmationText(user.name),
  });
};

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "X-Ops Auth API",
    status: "ok",
    endpoints: [
      "GET /api/health",
      "GET /api/auth/me",
      "POST /api/auth/signup",
      "POST /api/auth/login",
    ],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/auth/me", authenticateRequest, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find((entry) => entry.id === req.auth.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found for this token." });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return res.status(500).json({ message: "Could not validate session." });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const users = await readUsers();
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      existingUser.name = name;
      existingUser.passwordHash = await bcrypt.hash(password, 10);

      await writeUsers(users);

      try {
        await sendSignupConfirmationEmail(existingUser);
      } catch (emailError) {
        console.error("Signup confirmation email failed:", emailError);
      }

      return res.status(200).json({
        message: "Account already existed. Credentials updated and signed in.",
        token: createAuthToken(existingUser),
        user: sanitizeUser(existingUser),
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    try {
      await sendSignupConfirmationEmail(newUser);
    } catch (emailError) {
      console.error("Signup confirmation email failed:", emailError);
    }

    return res.status(201).json({
      message: "Account created successfully.",
      token: createAuthToken(newUser),
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(500).json({ message: "Could not create account. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const users = await readUsers();
    const user = users.find((entry) => entry.email === email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      token: createAuthToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Could not sign in. Please try again." });
  }
});

export default app;

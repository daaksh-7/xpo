import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

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
const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
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
  role: user.role,
  createdAt: user.createdAt,
});

const createAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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

const requireAdmin = (req, res, next) => {
  if (!req.auth || req.auth.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
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

const resolveRole = (email) => {
  if (!adminEmail) {
    return "member";
  }
  return normalizeEmail(email) === adminEmail ? "admin" : "member";
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
      existingUser.role = resolveRole(email);
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
      role: resolveRole(email),
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

    user.role = resolveRole(user.email);
    await writeUsers(users);

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

app.get("/api/admin/users", authenticateRequest, requireAdmin, async (_req, res) => {
  try {
    const users = await readUsers();
    const sanitized = users
      .map((user) => sanitizeUser(user))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.json({ users: sanitized });
  } catch {
    return res.status(500).json({ message: "Could not load users." });
  }
});

const dataDir = process.env.VERCEL ? path.join("/tmp", "xops-data") : path.resolve("data");
const uploadsDir = path.join(dataDir, "gallery-uploads");
const metaDir = path.join(dataDir, "gallery-meta");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxUploadSizeBytes = 8 * 1024 * 1024;

const UNCATEGORIZED = "uncategorized";
const galleryCategories = ["workshops", "hackathons", "technical-events", "projects", "fun-activities"];

const ensureGalleryDirectories = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });
  await fs.mkdir(path.join(metaDir, UNCATEGORIZED), { recursive: true });
  for (const category of galleryCategories) {
    await fs.mkdir(path.join(uploadsDir, category), { recursive: true });
    await fs.mkdir(path.join(metaDir, category), { recursive: true });
  }
};

ensureGalleryDirectories().catch((error) => {
  console.error("Gallery directory setup failed:", error);
});

app.use("/uploads", express.static(uploadsDir));

const getGalleryCategory = (req) => {
  const raw = req.query?.category;
  if (typeof raw !== "string") {
    return null;
  }
  const category = raw.trim().toLowerCase();
  if (!category || category === "all") {
    return null;
  }
  if (category === UNCATEGORIZED) {
    return UNCATEGORIZED;
  }
  if (!galleryCategories.includes(category)) {
    return "INVALID";
  }
  return category;
};

const getMetaPath = (category, filename) => path.join(metaDir, category, `${filename}.json`);

const readMeta = (category, filename) => {
  const metaPath = getMetaPath(category, filename);
  try {
    if (!fsSync.existsSync(metaPath)) {
      return null;
    }
    const raw = fsSync.readFileSync(metaPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writeMeta = (category, filename, meta) => {
  const metaPath = getMetaPath(category, filename);
  try {
    const categoryMetaDir = path.dirname(metaPath);
    if (!fsSync.existsSync(categoryMetaDir)) {
      fsSync.mkdirSync(categoryMetaDir, { recursive: true });
    }
    fsSync.writeFileSync(metaPath, `${JSON.stringify(meta)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
};

const deleteMeta = (category, filename) => {
  const metaPath = getMetaPath(category, filename);
  try {
    if (fsSync.existsSync(metaPath)) {
      fsSync.unlinkSync(metaPath);
    }
  } catch {}
};

const formatUploadedAt = (filename, stats) => {
  const match = /^(\d+)-/.exec(filename);
  if (match) {
    const timestamp = Number(match[1]);
    if (Number.isFinite(timestamp) && timestamp > 0) {
      return new Date(timestamp).toISOString();
    }
  }
  return new Date(stats.mtimeMs).toISOString();
};

const guessMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
};

const toGalleryPhotoResponse = (_req, category, filename, originalName, stats) => ({
  id: `${category}::${filename}`,
  name: originalName || filename,
  url: category === UNCATEGORIZED ? `/uploads/${filename}` : `/uploads/${category}/${filename}`,
  mimeType: guessMimeType(filename),
  size: stats.size,
  uploadedAt: formatUploadedAt(filename, stats),
  category,
});

app.get("/api/gallery", async (req, res) => {
  const category = getGalleryCategory(req);
  if (category === "INVALID") {
    return res.status(400).json({ message: "Invalid gallery category." });
  }

  const photos = [];

  const scanDir = (dirPath, cat) => {
    if (!fsSync.existsSync(dirPath)) {
      return;
    }

    const entries = fsSync.readdirSync(dirPath, { withFileTypes: true });
    entries.forEach((entry) => {
      if (!entry.isFile()) {
        return;
      }

      const filename = entry.name;
      const filePath = path.join(dirPath, filename);
      let stats;
      try {
        stats = fsSync.statSync(filePath);
      } catch {
        return;
      }

      const meta = readMeta(cat, filename);
      const displayName = typeof meta?.originalName === "string" ? meta.originalName : filename;
      photos.push(toGalleryPhotoResponse(req, cat, filename, displayName, stats));
    });
  };

  if (!category) {
    galleryCategories.forEach((cat) => scanDir(path.join(uploadsDir, cat), cat));
    scanDir(uploadsDir, UNCATEGORIZED);
  } else if (category === UNCATEGORIZED) {
    scanDir(uploadsDir, UNCATEGORIZED);
  } else {
    scanDir(path.join(uploadsDir, category), category);
  }

  photos.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return res.json({ photos });
});

const categorizedStorage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const category = getGalleryCategory(req);
    if (!category || category === "INVALID" || category === UNCATEGORIZED) {
      return callback(new Error("Please choose a valid gallery category."));
    }
    const categoryDir = path.join(uploadsDir, category);
    if (!fsSync.existsSync(categoryDir)) {
      fsSync.mkdirSync(categoryDir, { recursive: true });
    }
    return callback(null, categoryDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname) || ".jpg";
    callback(null, `${Date.now()}-${crypto.randomUUID()}${ext.toLowerCase()}`);
  },
});

const categorizedUpload = multer({
  storage: categorizedStorage,
  limits: {
    fileSize: maxUploadSizeBytes,
    files: 10,
  },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return callback(null, true);
    }

    return callback(new Error("Only JPG, PNG, WEBP, and GIF files are allowed."));
  },
});

app.post("/api/gallery", categorizedUpload.array("photos", 10), (req, res) => {
  const category = getGalleryCategory(req);
  if (!category || category === "INVALID" || category === UNCATEGORIZED) {
    return res.status(400).json({ message: "Please choose a valid gallery category." });
  }

  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) {
    return res.status(400).json({ message: "Please upload at least one image." });
  }

  const created = files
    .map((file) => {
      const filePath = path.join(uploadsDir, category, file.filename);
      let stats;
      try {
        stats = fsSync.statSync(filePath);
      } catch {
        return null;
      }

      const metaSaved = writeMeta(category, file.filename, { originalName: file.originalname });
      if (!metaSaved) {
        return null;
      }

      return toGalleryPhotoResponse(req, category, file.filename, file.originalname, stats);
    })
    .filter(Boolean);

  return res.status(201).json({ photos: created });
});

app.post("/api/gallery/assign", authenticateRequest, requireAdmin, async (req, res) => {
  const targetCategory = String(req.body?.category || "").trim().toLowerCase();
  const rawId = String(req.body?.id || req.body?.filename || "");

  if (!galleryCategories.includes(targetCategory)) {
    return res.status(400).json({ message: "Invalid target category." });
  }

  const decoded = decodeURIComponent(rawId);
  const [, filenameFromId] = decoded.split("::");
  const filename = filenameFromId || decoded;

  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return res.status(400).json({ message: "Invalid filename." });
  }

  const sourcePath = path.join(uploadsDir, filename);
  const destinationDir = path.join(uploadsDir, targetCategory);
  const destinationPath = path.join(destinationDir, filename);
  const sourceMetaPath = getMetaPath(UNCATEGORIZED, filename);
  const destinationMetaPath = getMetaPath(targetCategory, filename);

  try {
    if (!fsSync.existsSync(sourcePath)) {
      return res.status(404).json({ message: "File not found." });
    }
    if (!fsSync.existsSync(destinationDir)) {
      fsSync.mkdirSync(destinationDir, { recursive: true });
    }
    fsSync.renameSync(sourcePath, destinationPath);
    try {
      if (fsSync.existsSync(sourceMetaPath)) {
        const destinationMetaDir = path.dirname(destinationMetaPath);
        if (!fsSync.existsSync(destinationMetaDir)) {
          fsSync.mkdirSync(destinationMetaDir, { recursive: true });
        }
        fsSync.renameSync(sourceMetaPath, destinationMetaPath);
      }
    } catch {}
    const stats = fsSync.statSync(destinationPath);
    const meta = readMeta(targetCategory, filename);
    const displayName = typeof meta?.originalName === "string" ? meta.originalName : filename;
    return res.json({ photo: toGalleryPhotoResponse(req, targetCategory, filename, displayName, stats) });
  } catch {
    return res.status(500).json({ message: "Could not move file." });
  }
});

app.delete("/api/gallery/:id", authenticateRequest, requireAdmin, (req, res) => {
  const rawId = decodeURIComponent(String(req.params.id || ""));
  const [category, filename] = rawId.split("::");

  if (!category || !filename) {
    return res.status(400).json({ message: "Invalid photo id." });
  }

  if (category !== UNCATEGORIZED && !galleryCategories.includes(category)) {
    return res.status(400).json({ message: "Invalid gallery category." });
  }

  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return res.status(400).json({ message: "Invalid filename." });
  }

  const filePath = category === UNCATEGORIZED ? path.join(uploadsDir, filename) : path.join(uploadsDir, category, filename);
  try {
    if (fsSync.existsSync(filePath)) {
      fsSync.unlinkSync(filePath);
      deleteMeta(category, filename);
      return res.json({ ok: true });
    }
  } catch {
    return res.status(500).json({ message: "Could not delete photo file." });
  }

  return res.status(404).json({ message: "Photo not found." });
});

export default app;

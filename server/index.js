import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import crypto from "node:crypto";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@xops.club").toLowerCase();

const dataDir = path.resolve("data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(dataDir, "gallery-uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "xops.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS gallery_photos (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxUploadSizeBytes = 8 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname) || ".jpg";
    callback(null, `${Date.now()}-${crypto.randomUUID()}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
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

const toGalleryPhotoResponse = (req, row) => ({
  id: row.id,
  name: row.original_name,
  url: `${req.protocol}://${req.get("host")}/uploads/${row.filename}`,
  mimeType: row.mime_type,
  size: row.size,
  uploadedAt: row.uploaded_at,
});

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/gallery", (req, res) => {
  const photos = db
    .prepare(
      "SELECT id, filename, original_name, mime_type, size, uploaded_at FROM gallery_photos ORDER BY datetime(uploaded_at) DESC"
    )
    .all();

  return res.json({ photos: photos.map((row) => toGalleryPhotoResponse(req, row)) });
});

app.post("/api/gallery", upload.array("photos", 10), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    return res.status(400).json({ message: "Please upload at least one image." });
  }

  const insert = db.prepare(
    "INSERT INTO gallery_photos (id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?)"
  );

  const created = files.map((file) => {
    const id = crypto.randomUUID();
    insert.run(id, file.filename, file.originalname, file.mimetype, file.size);

    const row = db
      .prepare(
        "SELECT id, filename, original_name, mime_type, size, uploaded_at FROM gallery_photos WHERE id = ?"
      )
      .get(id);

    return toGalleryPhotoResponse(req, row);
  });

  return res.status(201).json({ photos: created });
});

app.delete("/api/gallery/:id", (req, res) => {
  const row = db
    .prepare("SELECT id, filename FROM gallery_photos WHERE id = ?")
    .get(req.params.id);

  if (!row) {
    return res.status(404).json({ message: "Photo not found." });
  }

  db.prepare("DELETE FROM gallery_photos WHERE id = ?").run(req.params.id);

  const filePath = path.join(uploadsDir, row.filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    return res.status(500).json({ message: "Photo deleted from DB but file cleanup failed." });
  }

  return res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedName = String(name).trim();
  if (normalizedName.length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ message: "Account already exists for this email" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const role = normalizedEmail === ADMIN_EMAIL ? "admin" : "member";

  const insert = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(normalizedName, normalizedEmail, passwordHash, role);

  const user = db
    .prepare("SELECT id, name, email, role, created_at as createdAt FROM users WHERE id = ?")
    .get(insert.lastInsertRowid);

  const token = signToken(user);
  return res.status(201).json({ token, user });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const userRecord = db
    .prepare("SELECT id, name, email, role, password_hash, created_at as createdAt FROM users WHERE email = ?")
    .get(normalizedEmail);

  if (!userRecord) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const matches = await bcrypt.compare(String(password), userRecord.password_hash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    createdAt: userRecord.createdAt,
  };

  const token = signToken(user);
  return res.json({ token, user });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, created_at as createdAt FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user });
});

app.get("/api/admin/users", authRequired, adminRequired, (_req, res) => {
  const users = db
    .prepare(
      "SELECT id, name, email, role, created_at as createdAt FROM users ORDER BY datetime(created_at) DESC"
    )
    .all();

  return res.json({ users });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: `Each file must be ${maxUploadSizeBytes / (1024 * 1024)}MB or less.` });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Admin signup email: ${ADMIN_EMAIL}`);
});

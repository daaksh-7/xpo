import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";

function getRoleForEmail(email) {
  if (!ADMIN_EMAIL) {
    return "member";
  }

  return String(email).toLowerCase().trim() === ADMIN_EMAIL ? "admin" : "member";
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Use a Supabase Postgres connection string.");
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
});

const defaultCmsContent = {
  home_badge_text: "Welcome to the Future of Tech",
  home_title: "The X-Ops Club",
  home_subtitle:
    "Empowering the next generation of tech innovators through workshops, hackathons, and a vibrant community of passionate developers.",
  home_primary_cta_text: "Join X-Ops Today",
  home_primary_cta_link: "/signup",
  home_secondary_cta_text: "Explore Events",
  home_secondary_cta_link: "/events",
  home_stat_members: "30+",
  home_stat_events: "1+",
  home_stat_partners: "3+",

  about_hero_title: "About X-Ops",
  about_hero_description:
    "X-Ops Club is a student-led community dedicated to advancing DevOps, AI, and automation through hands-on learning.",
  about_mission_heading: "Our Mission",
  about_mission_body:
    "We empower the next generation of tech innovators through workshops, hackathons, mentorship, and community collaboration.",

  announcement_enabled: true,
  announcement_title: "GET FREE ORACLE & MICROSOFT CERTIFICATIONS!",
  announcement_body: "A FREE E-Certificate of Participation will be provided to all attendees.",
  announcement_speaker: "Dr. Rajesh Bingu Ph.D.",
  announcement_join_link: "https://meet.google.com/bvp-cytn-iwj",
  announcement_date: "17-10-2025 (Friday)",
  announcement_time: "07.00 PM",
  announcement_mode: "Online (Google Meet)",

  navbar_links_json: JSON.stringify([
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "About", path: "/about" },
  ]),
  footer_quick_links_json: JSON.stringify([
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "About", path: "/about" },
  ]),
  footer_involved_links_json: JSON.stringify([
    { name: "Join Us", path: "/signup" },
    { name: "Upcoming Events", path: "/events" },
    { name: "Contact", path: "/about" },
  ]),
  social_links_json: JSON.stringify([
    { label: "LinkedIn", href: "https://www.linkedin.com/in/xops-club-ju-fet/" },
    { label: "Instagram", href: "https://www.instagram.com/xops.club_ju/" },
    { label: "Email", href: "https://mail.google.com/mail/?view=cm&fs=1&to=xopsclub.cse.ju@gmail.com" },
  ]),

  logo_nav_url: "/favicon.ico",
  logo_footer_url: "/X-Ops Club logo design.png",
  logo_partner_url: "/jain logo main.png",
  footer_brand_text:
    "Empowering the next generation of tech innovators through workshops, hackathons, and a vibrant community of passionate developers.",

  events_json: JSON.stringify([
    {
      id: "event-1",
      title: "AI/ML Workshop",
      description: "Hands-on workshop on practical AI workflows.",
      date: "Feb 15, 2026",
      time: "10:00 AM",
      location: "Virtual",
      type: "workshop",
      attendees: 40,
      maxAttendees: 120,
      image: "🤖",
      featured: true,
      joinLink: "",
      registrationClosed: false,
    },
    {
      id: "event-2",
      title: "Spring Hackathon",
      description: "Build and demo projects with your team.",
      date: "Mar 1-2, 2026",
      time: "09:00 AM",
      location: "Campus",
      type: "hackathon",
      attendees: 90,
      maxAttendees: 120,
      image: "🏆",
      featured: true,
      joinLink: "",
      registrationClosed: false,
    },
  ]),
};

const cmsContentKeys = new Set(Object.keys(defaultCmsContent));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (FRONTEND_ORIGIN && origin === FRONTEND_ORIGIN) {
        return callback(null, true);
      }

      if (origin.includes("localhost") || origin.endsWith(".vercel.app") || origin.endsWith(".app.github.dev")) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin denied"));
    },
    credentials: true,
  })
);
app.use(express.json());

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

async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      content_key TEXT PRIMARY KEY,
      content_value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getCmsContent() {
  const content = { ...defaultCmsContent };
  const { rows } = await db.query("SELECT content_key, content_value FROM site_content");

  for (const row of rows) {
    if (!cmsContentKeys.has(row.content_key)) {
      continue;
    }

    content[row.content_key] = row.content_value;
  }

  return content;
}

function sanitizeCmsContent(input) {
  const sanitized = {};

  for (const [key, value] of Object.entries(input ?? {})) {
    if (!cmsContentKeys.has(key)) {
      continue;
    }

    const defaultValue = defaultCmsContent[key];

    if (typeof defaultValue === "boolean") {
      sanitized[key] = Boolean(value);
      continue;
    }

    sanitized[key] = String(value ?? "").trim();
  }

  return sanitized;
}

async function saveCmsContent(contentPatch) {
  const entries = Object.entries(contentPatch);

  for (const [key, value] of entries) {
    await db.query(
      `INSERT INTO site_content (content_key, content_value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (content_key)
       DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
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

    const existing = await db.query(
      "SELECT id, role FROM users WHERE email = $1",
      [normalizedEmail]
    );

    const passwordHash = await bcrypt.hash(String(password), 10);

    if (existing.rows[0]) {
      const enforcedRole = getRoleForEmail(normalizedEmail);
      await db.query(
        "UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE id = $4",
        [normalizedName, passwordHash, enforcedRole, existing.rows[0].id]
      );

      const userResult = await db.query(
        "SELECT id, name, email, role, created_at as \"createdAt\" FROM users WHERE id = $1",
        [existing.rows[0].id]
      );

      const user = userResult.rows[0];
      const token = signToken(user);

      return res.status(200).json({
        message: "Account already existed. Credentials updated and signed in.",
        token,
        user,
      });
    }

    const role = getRoleForEmail(normalizedEmail);

    const insert = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at as \"createdAt\"",
      [normalizedName, normalizedEmail, passwordHash, role]
    );

    const user = insert.rows[0];
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    console.error("Signup failed", error);
    return res.status(500).json({ message: "Could not create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const userResult = await db.query(
      "SELECT id, name, email, role, password_hash, created_at as \"createdAt\" FROM users WHERE email = $1",
      [normalizedEmail]
    );

    const userRecord = userResult.rows[0];
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

    const enforcedRole = getRoleForEmail(user.email);
    if (user.role !== enforcedRole) {
      await db.query("UPDATE users SET role = $1 WHERE id = $2", [enforcedRole, user.id]);
      user.role = enforcedRole;
    }

    const token = signToken(user);
    return res.json({ token, user });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ message: "Could not sign in" });
  }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const userResult = await db.query(
    "SELECT id, name, email, role, created_at as \"createdAt\" FROM users WHERE id = $1",
    [req.user.id]
  );

  const user = userResult.rows[0];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user });
});

app.get("/api/admin/users", authRequired, adminRequired, async (_req, res) => {
  const users = await db.query(
    "SELECT id, name, email, role, created_at as \"createdAt\" FROM users ORDER BY created_at DESC"
  );

  return res.json({ users: users.rows });
});

app.get("/api/content/public", async (_req, res) => {
  const content = await getCmsContent();
  return res.json({ content });
});

app.get("/api/admin/content", authRequired, adminRequired, async (_req, res) => {
  const content = await getCmsContent();
  return res.json({ content });
});

app.put("/api/admin/content", authRequired, adminRequired, async (req, res) => {
  const patch = sanitizeCmsContent(req.body?.content);
  await saveCmsContent(patch);

  const content = await getCmsContent();
  return res.json({
    message: "Content updated successfully.",
    content,
  });
});

async function start() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
    if (ADMIN_EMAIL) {
      console.log(`Admin access email: ${ADMIN_EMAIL}`);
    } else {
      console.log("ADMIN_EMAIL not set. All users will be regular members.");
    }
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

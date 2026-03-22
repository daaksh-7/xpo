import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const allowLocalhost = process.env.NODE_ENV !== "production";
const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();

const usersFilePath = process.env.VERCEL
  ? path.join("/tmp", "xops-users.json")
  : path.join(__dirname, "data", "users.json");
const contentFilePath = process.env.VERCEL
  ? path.join("/tmp", "xops-content.json")
  : path.join(__dirname, "data", "site-content.json");

const jwtSecret = process.env.JWT_SECRET || "dev-only-change-this-secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

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

const getRoleForEmail = (email) => {
  if (!adminEmail) {
    return "member";
  }

  return normalizeEmail(email) === adminEmail ? "admin" : "member";
};

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
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  return next();
};

const ensureJsonFile = async (filePath, defaultValue) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, `${JSON.stringify(defaultValue, null, 2)}\n`, "utf8");
  }
};

const readUsers = async () => {
  await ensureJsonFile(usersFilePath, []);
  const raw = await fs.readFile(usersFilePath, "utf8");

  try {
    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed) ? parsed : [];

    for (const user of users) {
      user.role = getRoleForEmail(user.email);
    }

    return users;
  } catch {
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(usersFilePath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
};

const readContent = async () => {
  await ensureJsonFile(contentFilePath, defaultCmsContent);
  const raw = await fs.readFile(contentFilePath, "utf8");

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return { ...defaultCmsContent };
    }

    return {
      ...defaultCmsContent,
      ...parsed,
    };
  } catch {
    return { ...defaultCmsContent };
  }
};

const writeContent = async (content) => {
  await fs.writeFile(contentFilePath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
};

const sanitizeContentPatch = (input) => {
  const output = {};

  for (const [key, value] of Object.entries(input ?? {})) {
    if (!cmsContentKeys.has(key)) {
      continue;
    }

    if (typeof defaultCmsContent[key] === "boolean") {
      output[key] = Boolean(value);
      continue;
    }

    output[key] = String(value ?? "").trim();
  }

  return output;
};

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "X-Ops API",
    status: "ok",
    endpoints: [
      "GET /api/health",
      "GET /api/content/public",
      "GET /api/auth/me",
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "GET /api/admin/users",
      "GET /api/admin/content",
      "PUT /api/admin/content",
    ],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/content/public", async (_req, res) => {
  try {
    const content = await readContent();
    return res.status(200).json({ content });
  } catch (error) {
    console.error("Content read failed:", error);
    return res.status(500).json({ message: "Could not load site content." });
  }
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
      existingUser.role = getRoleForEmail(existingUser.email);

      await writeUsers(users);

      return res.status(200).json({
        message: "Account already existed. Credentials updated and signed in.",
        token: createAuthToken(existingUser),
        user: sanitizeUser(existingUser),
      });
    }

    const role = getRoleForEmail(email);

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

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

    user.role = getRoleForEmail(user.email);
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
    return res.status(200).json({ users: users.map(sanitizeUser) });
  } catch (error) {
    console.error("Admin users load failed:", error);
    return res.status(500).json({ message: "Could not load users." });
  }
});

app.get("/api/admin/content", authenticateRequest, requireAdmin, async (_req, res) => {
  try {
    const content = await readContent();
    return res.status(200).json({ content });
  } catch (error) {
    console.error("Admin content load failed:", error);
    return res.status(500).json({ message: "Could not load content." });
  }
});

app.put("/api/admin/content", authenticateRequest, requireAdmin, async (req, res) => {
  try {
    const content = await readContent();
    const patch = sanitizeContentPatch(req.body?.content);
    const updated = { ...content, ...patch };

    await writeContent(updated);

    return res.status(200).json({
      message: "Content updated successfully.",
      content: updated,
    });
  } catch (error) {
    console.error("Admin content save failed:", error);
    return res.status(500).json({ message: "Could not save content." });
  }
});

export default app;

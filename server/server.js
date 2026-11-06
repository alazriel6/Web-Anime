import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "./db.js";

dotenv.config();
const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Custom lightweight cookie parser untuk membaca httpOnly cookie
app.use((req, res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const name = parts[0]?.trim();
      if (name) {
        req.cookies[name] = decodeURIComponent(parts.slice(1).join("=").trim());
      }
    });
  }
  next();
});

// Rate limiting untuk mencegah brute-force login pada endpoint admin
const loginAttempts = new Map();

const checkLoginRateLimit = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (now < record.resetTime) {
      if (record.count >= 5) {
        const remainingMinutes = Math.ceil((record.resetTime - now) / 60000);
        return res.status(429).json({
          success: false,
          error: `Terlalu banyak percobaan login gagal. Demi keamanan, silakan coba lagi dalam ${remainingMinutes} menit.`
        });
      }
    } else {
      loginAttempts.delete(ip);
    }
  }
  next();
};

const recordFailedLogin = (ip) => {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && now < record.resetTime) {
    record.count += 1;
  } else {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
  }
};

const resetLoginAttempts = (ip) => {
  loginAttempts.delete(ip);
};

// Middleware verifikasi token JWT admin (dari httpOnly cookie atau Bearer header)
const verifyAdmin = (req, res, next) => {
  try {
    let token = req.cookies?.jacob_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Akses ditolak. Silakan login sebagai Admin Jacob terlebih dahulu."
      });
    }

    const secret = process.env.JWT_SECRET || "jacob_super_secret_anime_jwt_key_2026_99a8b7c6d5e4f3";
    const decoded = jwt.verify(token, secret);

    const adminUsername = process.env.ADMIN_USERNAME || "jacob";
    if (decoded.role !== "admin" || decoded.username.toLowerCase() !== adminUsername.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: "Akses terlarang. Anda bukan admin Jacob."
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Sesi login kedaluwarsa atau tidak valid. Silakan login kembali."
    });
  }
};

// ==========================================
// ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/admin/login
app.post("/api/admin/login", checkLoginRateLimit, async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || "jacob";
    const adminPassword = process.env.ADMIN_PASSWORD || "JacobAnime2026!";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username dan password wajib diisi." });
    }

    const isUsernameMatch = username.trim().toLowerCase() === adminUsername.toLowerCase();
    let isPasswordMatch = false;

    if (isUsernameMatch) {
      if (adminPasswordHash) {
        isPasswordMatch = await bcrypt.compare(password, adminPasswordHash);
      } else if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$")) {
        isPasswordMatch = await bcrypt.compare(password, adminPassword);
      } else {
        isPasswordMatch = password === adminPassword;
      }
    }

    if (!isUsernameMatch || !isPasswordMatch) {
      recordFailedLogin(ip);
      await new Promise((resolve) => setTimeout(resolve, 600));
      return res.status(401).json({
        success: false,
        error: "Username atau password admin salah."
      });
    }

    resetLoginAttempts(ip);

    const secret = process.env.JWT_SECRET || "jacob_super_secret_anime_jwt_key_2026_99a8b7c6d5e4f3";
    const token = jwt.sign(
      {
        username: adminUsername,
        role: "admin",
      },
      secret,
      { expiresIn: "7d" }
    );

    res.cookie("jacob_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({
      success: true,
      message: "Login berhasil sebagai Admin Jacob",
      user: {
        username: adminUsername,
        role: "admin"
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, error: "Terjadi kesalahan server saat login" });
  }
});

// GET /api/admin/me - Cek session aktif
app.get("/api/admin/me", verifyAdmin, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      username: req.user.username,
      role: req.user.role
    }
  });
});

// POST /api/admin/logout - Hapus cookie httpOnly
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("jacob_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  });
  res.json({ success: true, message: "Berhasil logout" });
});

// GET all anime
app.get("/api/anime", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.image, 
        a.release_date,
        a.note,
        a.rating,
        a.url,
        a.total_episodes,
        a.mal_score,
        a.click_count,
        ARRAY_AGG(DISTINCT g.name) AS genres,
        ARRAY_AGG(DISTINCT CONCAT(s.season, ' ', s.year)) FILTER (WHERE s.id IS NOT NULL) AS seasons
      FROM anime a
      LEFT JOIN anime_genres ag ON a.id = ag.anime_id
      LEFT JOIN genres g ON ag.genre_id = g.id
      LEFT JOIN anime_seasons asn ON a.id = asn.anime_id
      LEFT JOIN seasons s ON asn.season_id = s.id
      GROUP BY a.id
      ORDER BY a.id;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching anime:", err);
    res.status(500).json({ error: "Failed to fetch anime", details: err.message });
  }
});

app.get("/api/genres", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM genres
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching genres:", err);
    res.status(500).json({ error: "Failed to fetch genres", details: err.message });
  }
});

app.post("/api/genres", verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Genre name is required" });
    }

    const cleanName = String(name).trim();
    let result = await pool.query(`
      SELECT id, name
      FROM genres
      WHERE name = $1
    `, [cleanName]);

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    }

    result = await pool.query(`
      INSERT INTO genres (name)
      VALUES ($1)
      RETURNING id, name
    `, [cleanName]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating genre:", err);
    res.status(500).json({ error: "Failed to create genre", details: err.message });
  }
});

app.get("/api/seasons", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, season, year
      FROM seasons
      ORDER BY year DESC, season ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching seasons:", err);
    res.status(500).json({ error: "Failed to fetch seasons", details: err.message });
  }
});

app.post("/api/seasons", verifyAdmin, async (req, res) => {
  try {
    const { season, year } = req.body;

    if (!season || !year) {
      return res.status(400).json({ error: "Season and year are required" });
    }

    const seasonName = String(season).trim();
    const seasonYear = Number(year);

    let result = await pool.query(`
      SELECT id, season, year
      FROM seasons
      WHERE season = $1 AND year = $2
    `, [seasonName, seasonYear]);

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    }

    result = await pool.query(`
      INSERT INTO seasons (season, year)
      VALUES ($1, $2)
      RETURNING id, season, year
    `, [seasonName, seasonYear]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating season:", err);
    res.status(500).json({ error: "Failed to create season", details: err.message });
  }
});

app.post("/api/anime", verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      image,
      release_date,
      rating,
      note,
      url,
      total_episodes,
      mal_score,
      click_count,
      selected_genres,
      season,
      year,
    } = req.body;

    if (!title || !release_date) {
      return res.status(400).json({ error: "Title and release_date are required" });
    }

    const genreNames = Array.isArray(selected_genres)
      ? selected_genres
          .map((genre) => String(genre).trim())
          .filter(Boolean)
      : [];

    const seasonName = season ? String(season).trim() : null;
    const seasonYear = year ? Number(year) : null;

    await pool.query("BEGIN");

    const animeResult = await pool.query(`
      INSERT INTO anime (
        title,
        image,
        release_date,
        rating,
        note,
        url,
        total_episodes,
        mal_score,
        click_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      title,
      image || "/default-image.png",
      release_date,
      rating === "" || rating === null || rating === undefined ? null : Number(rating),
      note || "",
      url || "",
      total_episodes === "" || total_episodes === null || total_episodes === undefined ? null : Number(total_episodes),
      mal_score === "" || mal_score === null || mal_score === undefined ? 0 : Number(mal_score),
      click_count === "" || click_count === null || click_count === undefined ? 0 : Number(click_count),
    ]);

    const animeId = animeResult.rows[0].id;

    for (const genreName of genreNames) {
      let genreResult = await pool.query(`
        SELECT id FROM genres WHERE name = $1
      `, [genreName]);

      if (genreResult.rows.length === 0) {
        genreResult = await pool.query(`
          INSERT INTO genres (name)
          VALUES ($1)
          RETURNING id
        `, [genreName]);
      }

      const genreId = genreResult.rows[0].id;

      await pool.query(`
        INSERT INTO anime_genres (anime_id, genre_id)
        VALUES ($1, $2)
        ON CONFLICT (anime_id, genre_id) DO NOTHING
      `, [animeId, genreId]);
    }

    if (seasonName && Number.isFinite(seasonYear)) {
      let seasonResult = await pool.query(`
        SELECT id FROM seasons WHERE season = $1 AND year = $2
      `, [seasonName, seasonYear]);

      if (seasonResult.rows.length === 0) {
        seasonResult = await pool.query(`
          INSERT INTO seasons (season, year)
          VALUES ($1, $2)
          RETURNING id
        `, [seasonName, seasonYear]);
      }

      const seasonId = seasonResult.rows[0].id;

      await pool.query(`
        INSERT INTO anime_seasons (anime_id, season_id)
        VALUES ($1, $2)
        ON CONFLICT (anime_id, season_id) DO NOTHING
      `, [animeId, seasonId]);
    }

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Anime inserted successfully",
      anime_id: animeId,
      genres: genreNames,
      season: seasonName,
      year: seasonYear,
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error inserting anime:", err);
    res.status(500).json({ error: "Failed to insert anime", details: err.message });
  }
});

// ✅ Update click count anime
app.post("/api/anime/:id/click", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE anime 
       SET click_count = click_count + 1 
       WHERE id = $1`,
      [id]
    );
    res.json({ success: true, message: "Click count updated" });
  } catch (err) {
    console.error("Error updating click count:", err);
    res.status(500).json({ error: "Failed to update click count" });
  }
});

app.get("/api/trending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.image, 
        a.release_date,
        a.note,
        a.rating,
        a.url,
        a.total_episodes,
        a.mal_score,
        a.click_count,
        ARRAY_AGG(DISTINCT g.name) AS genres,
        ARRAY_AGG(DISTINCT CONCAT(s.season, ' ', s.year)) FILTER (WHERE s.id IS NOT NULL) AS seasons
      FROM anime a
      LEFT JOIN anime_genres ag ON a.id = ag.anime_id
      LEFT JOIN genres g ON ag.genre_id = g.id
      LEFT JOIN anime_seasons asn ON a.id = asn.anime_id
      LEFT JOIN seasons s ON asn.season_id = s.id
      GROUP BY a.id
      ORDER BY a.click_count DESC
      LIMIT 12;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching trending anime:", err);
    res.status(500).json({ error: "Failed to fetch trending anime" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

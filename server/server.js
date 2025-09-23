import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// GET all anime
app.get("/api/anime", async (req, res) => {
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

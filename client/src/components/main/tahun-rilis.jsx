import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // ⬅️ tambahin Link
import "../../styles/tahun-rilis.css";

const TahunRilis = () => {
  const [tahunRilis, setTahunRilis] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [genres, setGenres] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [trendingAnime, setTrendingAnime] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/trending")
    .then((res) => res.json())
    .then((data) => setTrendingAnime(data))
    .catch((err) => console.error("Failed to fetch trending:", err));
}, []);

const handleAnimeClick = async (id, url) => {
  try {
    await fetch(`http://localhost:5000/api/anime/${id}/click`, {
      method: "POST",
    });
  } catch (err) {
    console.error("Failed to update click count:", err);
  } finally {
    // buka halaman anime di tab baru
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

  useEffect(() => {
    fetch("http://localhost:5000/api/anime")
      .then((res) => res.json())
      .then((data) => {
        setAnimeList(data);
        const allTahun = new Set();
        const allSeasons = new Set();
        const allGenres = new Set();

        data.forEach((anime) => {
          // Ambil tahun dari seasons
          if (anime.seasons && Array.isArray(anime.seasons)) {
            anime.seasons.forEach((s) => {
              const parts = s.split(" ");
              const tahun = parts[parts.length - 1];
              if (!isNaN(tahun)) allTahun.add(tahun);
              allSeasons.add(s);
            });
          }

          // Ambil genres
          if (anime.genres && Array.isArray(anime.genres)) {
            anime.genres.forEach((g) => allGenres.add(g));
          }
        });

        // Urut tahun desc
        setTahunRilis(Array.from(allTahun).sort((a, b) => b - a));

        // Urut seasons by tahun desc + urutan season
        const seasonOrder = ["Winter", "Spring", "Summer", "Fall"];
        setSeasons(
          Array.from(allSeasons).sort((a, b) => {
            const [seasonA, yearA] = a.split(" ");
            const [seasonB, yearB] = b.split(" ");

            if (yearA !== yearB) {
              return parseInt(yearB) - parseInt(yearA); // Tahun desc
            }
            return seasonOrder.indexOf(seasonA) - seasonOrder.indexOf(seasonB); // Urutan season
          })
        );

        // Urut genres alfabet
        setGenres(Array.from(allGenres).sort());
      })
      .catch((err) => console.error("Gagal fetch:", err));
  }, []);

  return (
    <div className="main-wrapper">
      <div className="container-main">
        <h1 className="main-title">
          {selectedSeason
            ? `TAHUN RILIS ANIME - SEASON: ${selectedSeason}`
            : selectedGenre
            ? `DAFTAR GENRE - GENRE: ${selectedGenre}`
            : "TAHUN RILIS ANIME"}
        </h1>
        <div className="content-wrapper">
          <div className="tahun-page">
            <ul className="tahun-grid">
              {tahunRilis.map((tahun, idx) => (
                <button
                  key={idx}
                  className="tahun-button"
                  onClick={() =>
                    navigate(`/?tahun=${encodeURIComponent(tahun)}`)
                  }
                >
                  {tahun}
                </button>
              ))}
            </ul>
            <div className="recomendation">
              <h2>🔥 Trending</h2>
              <div className="rekomendasi-list">
                {trendingAnime.map((anime) => (
                  <div key={anime.id} className="rekomendasi-card">
                    {/* IMAGE */}
                    <div
                      onClick={() => handleAnimeClick(anime.id, anime.url)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={anime.image} alt={anime.title} className="rekomendasi-thumb" />
                    </div>

                    {/* TITLE */}
                    <p
                      className="rekomendasi-title"
                      onClick={() => handleAnimeClick(anime.id, anime.url)}
                      style={{ cursor: "pointer", }}
                    >
                      {anime.title.length > 20 ? anime.title.slice(0, 17) + "..." : anime.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="side-column">
            <div className="side-content">
              <h2>Web Anime Ilegal</h2>
              <p>Kusonime</p>
              <a
                href="https://kusonime.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="side-thumb"
                  src="/gambar/kusonime.png"
                  alt="Kusonime"
                />
              </a>
              <p>Otakudesu</p>
              <a
                href="https://otakudesu.best/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="side-thumb"
                  src="/gambar/otakudesu.png"
                  alt="Otakudesu"
                />
              </a>
            </div>

            <div className="side-content">
              <h2>SEASONS ANIME</h2>
              <div className="seasons-grid">
                {seasons.map((season, idx) => (
                  <button
                    key={idx}
                    className={`season-button ${
                      season === selectedSeason ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedSeason(season);
                      setSelectedGenre("");
                      setCurrentPage(1);
                    }}
                  >
                    {season}
                  </button>
                ))}
              </div>
              {selectedSeason && (
                <button
                  className="season-button reset"
                  onClick={() => setSelectedSeason("")}
                >
                  🔄 Reset Season
                </button>
              )}
            </div>

            <div className="side-content">
              <h2>GENRES ANIME</h2>
              <div className="genres-grid">
                {genres.map((genre, idx) => (
                  <button
                    key={idx}
                    className={`genre-button ${
                      genre === selectedGenre ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedGenre(genre);
                      setSelectedSeason("");
                      setCurrentPage(1);
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              {selectedGenre && (
                <button
                  className="genre-button reset"
                  onClick={() => setSelectedGenre("")}
                >
                  🔄 Reset Genre
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TahunRilis;

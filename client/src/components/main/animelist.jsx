import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../styles/animelist.css";

const AnimeList = () => {
  const [animeList, setAnimeList] = useState([]);
  const [tahunRilis, setTahunRilis] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // state buat sorting judul
  const [sortOrder, setSortOrder] = useState("asc"); // asc = A→Z, desc = Z→A

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch("http://localhost:5000/api/anime")
      .then((res) => res.json())
      .then((data) => {
        setAnimeList(data);

        const allTahun = new Set();
        const allSeasons = new Set();
        const allGenres = new Set();

        data.forEach((anime) => {
          if (anime.seasons && Array.isArray(anime.seasons)) {
            anime.seasons.forEach((s) => {
              const parts = s.split(" ");
              const tahun = parts[parts.length - 1];
              if (!isNaN(tahun)) allTahun.add(tahun);
              allSeasons.add(s);
            });
          }

          if (anime.genres && Array.isArray(anime.genres)) {
            anime.genres.forEach((g) => allGenres.add(g));
          }
        });

        // Urutkan tahun terbaru → lama
        setTahunRilis(Array.from(allTahun).sort((a, b) => b - a));

        // Urutkan seasons: tahun terbaru dulu, lalu Winter→Spring→Summer→Fall
        setSeasons(
          Array.from(allSeasons).sort((a, b) => {
            const getYear = (s) => parseInt(s.split(" ").pop(), 10);
            const getSeasonOrder = (s) => {
              const season = s.split(" ")[0];
              const order = { Winter: 1, Spring: 2, Summer: 3, Fall: 4 };
              return order[season] || 5;
            };

            const yearA = getYear(a);
            const yearB = getYear(b);

            if (yearA !== yearB) return yearB - yearA; // tahun muda dulu
            return getSeasonOrder(a) - getSeasonOrder(b); // urutkan per musim
          })
        );

        setGenres(Array.from(allGenres).sort());
      })
      .catch((err) => console.error("Gagal fetch:", err));
  }, []);

  // anime list sorted sesuai judul
  const sortedAnimeList = [...animeList].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  return (
    <div className="main-wrapper">
      <div className="container-main">
        <h1 className="main-title">
          {selectedSeason
            ? `TAHUN RILIS ANIME - SEASON: ${selectedSeason}`
            : selectedGenre
            ? `DAFTAR GENRE - GENRE: ${selectedGenre}`
            : "DAFTAR ANIME"}
        </h1>

        {/* Tombol sorting judul */}
        <div className="sorting-controls">
          <button
            className={`sort-btn ${sortOrder === "asc" ? "active" : ""}`}
            onClick={() => setSortOrder("asc")}
          >
            🔤 A → Z
          </button>
          <button
            className={`sort-btn ${sortOrder === "desc" ? "active" : ""}`}
            onClick={() => setSortOrder("desc")}
          >
            🔡 Z → A
          </button>
        </div>

        <div className="content-wrapper">
          <div className="tahun-page">
            <div className="anime-list1">
              <ul>
                {sortedAnimeList.map((anime) => (
                  <li key={anime.id}>
                    <Link to={`/anime/${anime.id}`}>
                      {anime.title.length > 20
                        ? anime.title.slice(0, 80) + "..."
                        : anime.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SIDE CONTENT */}
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

export default AnimeList;

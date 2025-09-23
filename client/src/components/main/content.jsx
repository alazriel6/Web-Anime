import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom"; 
import "../../styles/content.css";
import { Clock, Tag, StickyNote, Calendar, Play, Star } from "lucide-react";

const Content = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams(); 
  const [selectedId, setSelectedId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [animeList, setAnimeList] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [anime, setAnime] = useState(null); 
  const [sortBy, setSortBy] = useState("default"); 
  const [trendingAnime, setTrendingAnime] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const itemsPerPage = 10;

  // 🔧 helper untuk update query tanpa reset filter
  const updateQuery = (updates) => {
    const params = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    navigate(`?${params.toString()}`);
  };

  // Handle search box
  const handleSearch = (e) => {
    e.preventDefault();
    updateQuery({ query: searchTerm, page: 1 });
  };

  // ambil query dari URL (search / filter)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page") || "1", 10);
    const query = params.get("query") || "";
    setSearchTerm(query);

    const gnere = params.get("genre") || "";
    setSelectedGenre(gnere);

    const season = params.get("season") || "";
    setSelectedSeason(season);

    const tahun = params.get("tahun") || "";
    setSelectedYear(tahun);

    const id = params.get("id") || "";
    setSelectedId(id);

    setCurrentPage(pageFromUrl);
  }, [location.search]);

  // fetch data anime
  useEffect(() => {
    fetch("http://localhost:5000/api/anime")
      .then((res) => res.json())
      .then((data) => {
        setAnimeList(data);

        if (id) {
          const selected = data.find((a) => a.id.toString() === id);
          setAnime(selected || null);
        }

        const uniqueSeasons = new Set();
        const uniqueGenres = new Set();

        data.forEach((anime) => {
          if (anime.seasons && anime.seasons.length > 0) {
            anime.seasons.forEach((s) => uniqueSeasons.add(s));
          }
          if (anime.genres && anime.genres.length > 0) {
            anime.genres.forEach((g) => uniqueGenres.add(g));
          }
        });

        const sortedSeasons = Array.from(uniqueSeasons).sort((a, b) => {
          const getYear = (s) => parseInt(s.split(" ").pop(), 10);
          const getSeasonOrder = (s) => {
            const season = s.split(" ")[0];
            const order = { Winter: 1, Spring: 2, Summer: 3, Fall: 4 };
            return order[season] || 5;
          };
          const yearA = getYear(a);
          const yearB = getYear(b);
          if (yearA !== yearB) return yearB - yearA;
          return getSeasonOrder(a) - getSeasonOrder(b);
        });

        setSeasons(sortedSeasons);
        setGenres([...uniqueGenres].sort());
      });
  }, [id]);

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
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // filter + sort
  const filteredAnime = animeList
    .filter((anime) => {
      if (id) return anime.id == id;
      const seasonMatch = selectedSeason
        ? anime.seasons?.includes(selectedSeason)
        : true;
      const genreMatch = selectedGenre
        ? anime.genres?.includes(selectedGenre)
        : true;
      const yearMatch = selectedYear
        ? anime.release_date?.startsWith(selectedYear)
        : true;
      const searchMatch = searchTerm
        ? anime.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return seasonMatch && genreMatch && yearMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      }
      if (sortBy === "mal") {
        return (parseFloat(b.mal_score) || 0) - (parseFloat(a.mal_score) || 0);
      }
      if (sortBy === "year") {
        return (
          (parseInt(b.release_date?.split("-")[0]) || 0) -
          (parseInt(a.release_date?.split("-")[0]) || 0)
        );
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // pagination
  const totalPages = Math.ceil(filteredAnime.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnimeList = filteredAnime.slice(startIndex, endIndex);

  return (
    <div className="main-wrapper">
      <div className="container-main">
        <h1 className="main-title">
          {id
            ? "DETAIL ANIME"
            : selectedSeason
            ? `ANIME SEASON: ${selectedSeason}`
            : selectedGenre
            ? `ANIME GENRE: ${selectedGenre}`
            : selectedYear
            ? `ANIME TAHUN RILIS: ${selectedYear}`
            : "ANIME LIST"}
        </h1>
        <div className="content-wrapper">
          {/* LIST ANIME */}
          <div className="anime-list">
            {currentAnimeList.map((anime) => (
              <div key={anime.id} className="anime-card">
                <div
                  onClick={() => handleAnimeClick(anime.id, anime.url)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="anime-thumb"
                  />
                </div>
                <div className="anime-info">
                  <h2
                    className="anime-title"
                    onClick={() => handleAnimeClick(anime.id, anime.url)}
                    style={{ cursor: "pointer" }}
                  >
                    {anime.title}
                  </h2>
                  <p className="anime-time">
                    <Clock size={14} style={{ marginRight: "6px" }} />
                    Released on {anime.release_date}
                  </p>
                  <p className="anime-note">
                    <StickyNote size={14} style={{ marginRight: "6px" }} />
                    {anime.note || "No notes"}
                  </p>
                  <p className="anime-episode">
                    <Play size={14} style={{ marginRight: "6px" }} />
                    Episode : {anime.total_episodes || "N/A"}
                  </p>
                  <p className="anime-season">
                    <Calendar size={14} style={{ marginRight: "6px" }} />
                    Season :{" "}
                    {anime.seasons && anime.seasons.length > 0
                      ? anime.seasons.map((s, idx) => (
                          <span key={idx} className="season-tag">
                            {s}
                          </span>
                        ))
                      : "N/A"}
                  </p>
                  <p className="anime-genre">
                    <Tag size={14} style={{ marginRight: "6px" }} />
                    Genre :{" "}
                    {anime.genres.map((g, idx) => (
                      <span key={idx} className="genre-tag">
                        {g}
                      </span>
                    ))}
                  </p>
                  <p className="anime-rating">
                    <Star size={14} style={{ marginRight: "6px" }} />
                    Admin Rate :⭐ {anime.rating || "N/A"}
                  </p>
                  <p className="anime-rating">
                    <Star size={14} style={{ marginRight: "6px" }} />
                    MyAnimeList Score :⭐ {anime.mal_score || "N/A"}
                  </p>
                </div>
              </div>
            ))}

            {/* PAGINATION */}
            <div className="pagination">
              <span>
                Page {currentPage} of {totalPages}{" "}
              </span>

              <button
                disabled={currentPage === 1}
                onClick={() => updateQuery({ page: currentPage - 1 })}
              >
                « Prev
              </button>

              <button
                onClick={() => updateQuery({ page: 1 })}
                className={currentPage === 1 ? "active" : ""}
              >
                1
              </button>

              {currentPage > 4 && <span className="ellipsis">...</span>}

              {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
                .filter((p) => p > 1 && p < totalPages)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => updateQuery({ page: pageNum })}
                    className={pageNum === currentPage ? "active" : ""}
                  >
                    {pageNum}
                  </button>
                ))}

              {currentPage < totalPages - 3 && (
                <span className="ellipsis">...</span>
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => updateQuery({ page: currentPage + 1 })}
              >
                Next »
              </button>

              {totalPages > 1 && (
                <button
                  onClick={() => updateQuery({ page: totalPages })}
                  className={currentPage === totalPages ? "active" : ""}
                >
                  Last »
                </button>
              )}
            </div>

            {/* REKOMENDASI */}
            <div className="recomendation">
              <h2>🔥 Trending</h2>
              <div className="rekomendasi-list">
                {trendingAnime.map((anime) => (
                  <div key={anime.id} className="rekomendasi-card">
                    <div
                      onClick={() => handleAnimeClick(anime.id, anime.url)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="rekomendasi-thumb"
                      />
                    </div>
                    <p
                      className="rekomendasi-title"
                      onClick={() => handleAnimeClick(anime.id, anime.url)}
                      style={{ cursor: "pointer" }}
                    >
                      {anime.title.length > 20
                        ? anime.title.slice(0, 17) + "..."
                        : anime.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDE CONTENT */}
          <div className="side-column">
            <div className="side-content">
              <h2>Web Anime</h2>
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
              <h2>Sort Anime</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">🔄 Default</option>
                <option value="rating">⭐ Admin Rating</option>
                <option value="mal">⭐ MyAnimeList Score</option>
                <option value="year">📅 Tahun Rilis</option>
                <option value="title">🔤 Judul (A-Z)</option>
              </select>
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
                    onClick={() => updateQuery({ season, page: 1 })}
                  >
                    {season}
                  </button>
                ))}
              </div>
              {selectedSeason && (
                <button
                  className="season-button reset"
                  onClick={() => updateQuery({ season: "", page: 1 })}
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
                    onClick={() => updateQuery({ genre, page: 1 })}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              {selectedGenre && (
                <button
                  className="genre-button reset"
                  onClick={() => updateQuery({ genre: "", page: 1 })}
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

export default Content;

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";
import "../../styles/navbar.css";

function Navbar() {
  const { isAuthenticated, logout } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [trendingAnime, setTrendingAnime] = useState([]);

  const [rekomendasi, setRekomendasi] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Ambil data anime
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/anime");
        const data = await res.json();

        // Sort by rating desc, ambil 5
        const top5 = [...data]
          .filter((a) => a && a.rating !== undefined && a.rating !== null)
          .sort(
            (a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)
          );
        if (!cancelled) setRekomendasi(top5);
      } catch (e) {
        console.error("Gagal fetch /api/anime:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rotasi setiap 10 detik
  useEffect(() => {
    if (rekomendasi.length === 0) return;
    const id = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % rekomendasi.length);
    }, 10000);
    return () => clearInterval(id);
  }, [rekomendasi]);

  // Ambil 3 item untuk tampil
  const displayedAnime = (() => {
    if (rekomendasi.length === 0) return [];
    const windowSize = Math.min(3, rekomendasi.length);
    const out = [];
    for (let i = 0; i < windowSize; i++) {
      out.push(rekomendasi[(visibleIndex + i) % rekomendasi.length]);
    }
    return out;
  })();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      navigate(location.pathname);
    } else {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

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

  return (
    <nav className="navbar">
      <div className="container-nav">
        <div className="nav-brand">
          <Link to="/" className="logo">Anime List</Link>
          <button 
            type="button" 
            className="menu1-toggle" 
            onClick={toggleMenu} 
            aria-label="Toggle Navigation"
          >
            {isOpen ? "✕ Close" : "☰ Menu"}
          </button>
        </div>

        <ul className={`menu1 ${isOpen ? "open" : ""}`}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/anime-list" onClick={() => setIsOpen(false)}>Anime List</Link></li>
          <li><Link to="/genre" onClick={() => setIsOpen(false)}>Genre</Link></li>
          <li><Link to="/tahun-rilis" onClick={() => setIsOpen(false)}>Tahun Rilis</Link></li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/anime-insert" style={{ color: "#38bdf8", fontWeight: "bold" }} onClick={() => setIsOpen(false)}>
                  ➕ Add Anime
                </Link>
              </li>
              <li>
                <Link to="/jacob" style={{ color: "#a855f7", fontWeight: "bold" }} onClick={() => setIsOpen(false)}>
                  👑 Jacob Panel
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { logout(); setIsOpen(false); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    font: "inherit",
                    padding: "0.5rem 0",
                    fontWeight: "bold"
                  }}
                >
                  🚪 Logout
                </button>
              </li>
            </>
          )}
        </ul>

        <div className="search-box">
          <form onSubmit={handleSearch} className="search-form">
            <FaSearch className="search-icon" />
            <input
              className="search"
              type="text"
              name="search"
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </div>

      <div className="rekomendasi1">
        <h2 className="rekomendasi1-title">Rekomendasi:</h2>
        <ul className="rekomendasi1-list">
          {displayedAnime.map((anime) => (
            <li key={anime.id} className="rekomendasi1-item">
              <span
                onClick={() => handleAnimeClick(anime.id, anime.url)}
                style={{ cursor: "pointer" }}
                className="rekomendasi1-link"
              >
                {anime.title.length > 25
                  ? anime.title.slice(0, 25) + "..."
                  : anime.title}
              </span>
              <span className="rekomendasi1-rate">
                ⭐ {parseFloat(anime.rating) || "N/A"}
              </span>
            </li>
          ))}
          {displayedAnime.length === 0 && <li>Tidak ada data rekomendasi.</li>}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // ⬅️ tambahin Link
import { FaSearch } from "react-icons/fa";
import "../../styles/navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
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
          )
          .slice(0, 5);

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
  navigate(location.pathname); // tetap di halaman yang sama jika input kosong
} else { 
  navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
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
    // buka halaman anime di tab baru
    window.open(url, "_blank", "noopener,noreferrer");
  }
};


  return (
    <nav className="navbar">
      <div className="container-nav">
        <div className="logo">Anime List</div>
        <ul className={`menu1 ${isOpen ? "open" : ""}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/anime-list">Anime List</Link></li>
          <li><Link to="/genre">Genre</Link></li>
          <li><Link to="/tahun-rilis">Tahun Rilis</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>

<div className="search-box">
  <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center" }}>
    <FaSearch className="search-icon" />
    <input
      className="search"
      type="text"
      name="search"
      placeholder="Search.."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </form>
</div>


        <button className="menu1-toggle" onClick={toggleMenu}>
          {isOpen ? "Close" : "Open"} Menu
        </button>
      </div>
        <div className="rekomendasi1">
          <h2>Rekomendasi Anime</h2>
          <ul className="rekomendasi1-list">
            {displayedAnime.map((anime) => (
              <li key={anime.id} className="rekomendasi1-item">
                <span
                  onClick={() => handleAnimeClick(anime.id, anime.url)}
                  style={{ cursor: "pointer"}}
                >
                  {anime.title.length > 20
                    ? anime.title.slice(0, 30) + "..."
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

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import '../styles/animeInsertForm.css';
import '../styles/content.css';

// URL helper untuk mendukung Vite proxy (/api) dan direct backend (http://localhost:5000/api)
const API_BASE_CANDIDATES = [
  '/api',
  'http://localhost:5000/api'
];

async function apiFetch(endpoint, options = {}) {
  let lastError = null;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error(`Gagal menghubungi server untuk endpoint ${endpoint}`);
}

const DEFAULT_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi',
  'Mystery', 'Thriller', 'Horror', 'Supernatural', 'School', 'Shounen',
  'Shoujo', 'Seinen', 'Josei', 'Isekai', 'Historical', 'Military', 'Sports',
  'Music', 'Slice of Life', 'Mecha', 'Psychological', 'Ecchi'
];

const DEFAULT_SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];

function AnimeInsertForm() {
  const navigate = useNavigate();
  const { logout, adminUser } = useAdminAuth();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    title: '',
    image: '',
    release_date: new Date().toISOString().split('T')[0], // Default hari ini
    rating: '',
    note: '',
    url: '',
    total_episodes: '',
    mal_score: '',
    click_count: 0,
    selected_genres: [],
    season: 'Winter',
    year: currentYear
  });

  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [genresList, setGenresList] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState(DEFAULT_SEASONS);
  const [sideSeasons, setSideSeasons] = useState([]);
  const [newGenreInput, setNewGenreInput] = useState('');

  // Fetch daftar genre dan season dari backend/database
  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      setFetchingOptions(true);
      try {
        const [genresRes, seasonsRes] = await Promise.allSettled([
          apiFetch('/genres'),
          apiFetch('/seasons')
        ]);

        if (!isMounted) return;

        // Proses data genres dari database
        let dbGenres = [];
        if (genresRes.status === 'fulfilled' && genresRes.value.ok) {
          dbGenres = await genresRes.value.json();
        }

        const existingNames = new Set(dbGenres.map(g => g.name.toLowerCase()));
        const mergedGenres = [...dbGenres];

        // Tambahkan default genre jika belum ada di database
        DEFAULT_GENRES.forEach((name, idx) => {
          if (!existingNames.has(name.toLowerCase())) {
            mergedGenres.push({ id: `def-${idx}`, name });
          }
        });

        // Urutkan alfabetis
        mergedGenres.sort((a, b) => a.name.localeCompare(b.name));
        setGenresList(mergedGenres);

        // Proses data seasons dari database
        if (seasonsRes.status === 'fulfilled' && seasonsRes.value.ok) {
          const seasons = await seasonsRes.value.json();
          const uniqueSeasonNames = [...new Set(seasons.map(s => s.season))].filter(Boolean);
          if (uniqueSeasonNames.length > 0) {
            const order = ['Winter', 'Spring', 'Summer', 'Fall'];
            uniqueSeasonNames.sort((a, b) => order.indexOf(a) - order.indexOf(b));
            setSeasonOptions(uniqueSeasonNames);
          }

          // Buat list untuk sidebar: "Winter 2024", dsb.
          const formattedSideSeasons = seasons
            .filter(s => s.season && s.year)
            .map(s => `${s.season} ${s.year}`);
          const distinctSideSeasons = [...new Set(formattedSideSeasons)];
          setSideSeasons(distinctSideSeasons.slice(0, 15));
        }
      } catch (err) {
        console.error('Gagal mengambil genre/seasons dari database:', err);
      } finally {
        if (isMounted) setFetchingOptions(false);
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle input text, number, date
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle pilihan genre
  const handleGenreToggle = (genreName) => {
    setFormData(prev => {
      const exists = prev.selected_genres.includes(genreName);
      return {
        ...prev,
        selected_genres: exists
          ? prev.selected_genres.filter(name => name !== genreName)
          : [...prev.selected_genres, genreName]
      };
    });
  };

  // Tambah genre kustom baru
  const handleAddNewGenre = (e) => {
    e.preventDefault();
    const trimmed = newGenreInput.trim();
    if (!trimmed) return;

    // Cek apakah sudah ada di list
    const alreadyExists = genresList.some(g => g.name.toLowerCase() === trimmed.toLowerCase());
    if (!alreadyExists) {
      const newEntry = { id: `custom-${Date.now()}`, name: trimmed };
      setGenresList(prev => [...prev, newEntry].sort((a, b) => a.name.localeCompare(b.name)));
    }

    // Otomatis centang genre tersebut
    if (!formData.selected_genres.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        selected_genres: [...prev.selected_genres, trimmed]
      }));
    }

    setNewGenreInput('');
  };

  // Submit ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        title: formData.title.trim(),
        image: formData.image.trim() || '/default-image.png',
        release_date: formData.release_date,
        rating: formData.rating === '' ? null : parseFloat(formData.rating),
        note: formData.note.trim(),
        url: formData.url.trim(),
        total_episodes: formData.total_episodes === '' ? null : parseInt(formData.total_episodes, 10),
        mal_score: formData.mal_score === '' ? 0 : parseFloat(formData.mal_score),
        click_count: formData.click_count === '' ? 0 : parseInt(formData.click_count, 10),
        selected_genres: formData.selected_genres,
        season: formData.season,
        year: parseInt(formData.year, 10) || currentYear
      };

      const response = await apiFetch('/anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Gagal menambahkan anime');
      }

      setFeedback({
        type: 'success',
        message: `🎉 Anime "${formData.title}" berhasil ditambahkan ke database beserta Genre & Season!`
      });

      // Reset form ke nilai awal
      setFormData({
        title: '',
        image: '',
        release_date: new Date().toISOString().split('T')[0],
        rating: '',
        note: '',
        url: '',
        total_episodes: '',
        mal_score: '',
        click_count: 0,
        selected_genres: [],
        season: 'Winter',
        year: currentYear
      });

      // Scroll form ke atas
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error saat menambahkan anime:', error);
      setFeedback({
        type: 'error',
        message: `❌ Gagal menambahkan anime: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="container-main">
        {/* Admin Bar Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #1e3a8a',
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          color: '#cbd5e1',
          fontSize: '0.9rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>👑</span>
            <span>Admin: <strong style={{ color: '#60a5fa' }}>{adminUser?.username || 'Jacob'}</strong></span>
            <span style={{ color: '#10b981', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
              ● Full Access
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/jacob" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
              ⚙️ Dashboard Jacob
            </Link>
            <button
              type="button"
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              🚪 Keluar
            </button>
          </div>
        </div>

        <h1 className="main-title">TAMBAH ANIME BARU</h1>
        
        <div className="content-wrapper">
          {/* MAIN FORM COLUMN */}
          <div className="anime-insert-page">
            <form id="anime-insert-form" className="anime-insert-form" onSubmit={handleSubmit}>
              <div className="anime-insert-form__header">
                <h2 className="anime-insert-form__title">Form Input Anime</h2>
                {fetchingOptions && (
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    Memuat data database...
                  </span>
                )}
              </div>

              {feedback.message && (
                <div 
                  style={{
                    padding: '12px 16px',
                    marginBottom: '1.5rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: feedback.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                  }}
                >
                  {feedback.message}
                </div>
              )}

              <div className="anime-insert-form__body">
                {/* Title */}
                <div className="anime-insert-form__field anime-insert-form__full-width">
                  <label className="anime-insert-form__label" htmlFor="title">Judul Anime *</label>
                  <input
                    id="title"
                    className="anime-insert-form__input"
                    type="text"
                    name="title"
                    placeholder="Contoh: Solo Leveling"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Image URL & Preview */}
                <div className="anime-insert-form__field anime-insert-form__full-width">
                  <label className="anime-insert-form__label" htmlFor="image">Path Gambar / URL</label>
                  <input
                    id="image"
                    className="anime-insert-form__input"
                    type="text"
                    name="image"
                    placeholder="Contoh: /gambar/solo-leveling.png atau URL link gambar"
                    value={formData.image}
                    onChange={handleChange}
                  />
                  {formData.image && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>Preview:</span>
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Release Date */}
                <div className="anime-insert-form__field">
                  <label className="anime-insert-form__label" htmlFor="release_date">Tanggal Rilis *</label>
                  <input
                    id="release_date"
                    className="anime-insert-form__input"
                    type="date"
                    name="release_date"
                    value={formData.release_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Rating (1-10) */}
                <div className="anime-insert-form__field">
                  <label className="anime-insert-form__label" htmlFor="rating">Rating Admin (Skala 1-10)</label>
                  <input
                    id="rating"
                    className="anime-insert-form__input"
                    type="number"
                    name="rating"
                    min="1"
                    max="10"
                    step="0.1"
                    placeholder="Contoh: 9.0"
                    value={formData.rating}
                    onChange={handleChange}
                  />
                </div>

                {/* URL Streaming / Download */}
                <div className="anime-insert-form__field anime-insert-form__full-width">
                  <label className="anime-insert-form__label" htmlFor="url">URL Streaming / Download</label>
                  <input
                    id="url"
                    className="anime-insert-form__input"
                    type="url"
                    name="url"
                    placeholder="Contoh: https://kusonime.com/solo-leveling-sub-indo/"
                    value={formData.url}
                    onChange={handleChange}
                  />
                </div>

                {/* Total Episodes */}
                <div className="anime-insert-form__field">
                  <label className="anime-insert-form__label" htmlFor="total_episodes">Total Episode</label>
                  <input
                    id="total_episodes"
                    className="anime-insert-form__input"
                    type="number"
                    name="total_episodes"
                    placeholder="Contoh: 12"
                    value={formData.total_episodes}
                    onChange={handleChange}
                  />
                </div>

                {/* MyAnimeList Score */}
                <div className="anime-insert-form__field">
                  <label className="anime-insert-form__label" htmlFor="mal_score">Score MAL</label>
                  <input
                    id="mal_score"
                    className="anime-insert-form__input"
                    type="number"
                    name="mal_score"
                    step="0.01"
                    placeholder="Contoh: 8.45"
                    value={formData.mal_score}
                    onChange={handleChange}
                  />
                </div>

                {/* Initial Click Count */}
                <div className="anime-insert-form__field anime-insert-form__full-width">
                  <label className="anime-insert-form__label" htmlFor="click_count">Click Count Awal</label>
                  <input
                    id="click_count"
                    className="anime-insert-form__input"
                    type="number"
                    name="click_count"
                    placeholder="0"
                    value={formData.click_count}
                    onChange={handleChange}
                  />
                </div>

                {/* Genre Selections */}
                <div className="anime-insert-form__field anime-insert-form__full-width">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="anime-insert-form__label" style={{ margin: 0 }}>
                      Pilih Genre ({formData.selected_genres.length} dipilih)
                    </label>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Klik untuk memilih</span>
                  </div>

                  <div className="anime-insert-form__genres-container">
                    {genresList.map(genre => {
                      const isSelected = formData.selected_genres.includes(genre.name);
                      return (
                        <button
                          type="button"
                          key={genre.id || genre.name}
                          onClick={() => handleGenreToggle(genre.name)}
                          className={`anime-insert-form__genre-tag ${isSelected ? 'anime-insert-form__genre-tag--selected' : ''}`}
                          style={{ border: 'none', outline: 'none' }}
                        >
                          {isSelected ? `✓ ${genre.name}` : `+ ${genre.name}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input tambahan jika ingin tambah genre baru */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Tambah genre baru jika belum ada..."
                      value={newGenreInput}
                      onChange={(e) => setNewGenreInput(e.target.value)}
                      className="anime-insert-form__input"
                      style={{ flex: 1, padding: '0.5rem 0.8rem', fontSize: '0.9rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewGenre(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddNewGenre}
                      className="anime-insert-form__cancel-btn"
                    >
                      + Tambah Genre
                    </button>
                  </div>
                </div>

                {/* Season & Year */}
                <div className="anime-insert-form__field">
                  <label className="anime-insert-form__label" htmlFor="season">Musim (Season)</label>
                  <select
                    id="season"
                    className="anime-insert-form__select"
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                  >
                    {seasonOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="anime-insert-form__field">
                  <label className="anime-insert-form__label" htmlFor="year">Tahun Rilis</label>
                  <input
                    id="year"
                    className="anime-insert-form__input"
                    type="number"
                    name="year"
                    min="1950"
                    max="2100"
                    placeholder="Contoh: 2024"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>

                {/* Note / Synopsis */}
                <div className="anime-insert-form__field anime-insert-form__full-width">
                  <label className="anime-insert-form__label" htmlFor="note">Sinopsis / Catatan Singkat</label>
                  <textarea
                    id="note"
                    className="anime-insert-form__textarea"
                    name="note"
                    placeholder="Sinopsis singkat mengenai anime ini..."
                    value={formData.note}
                    onChange={handleChange}
                  />
                </div>

                <div className="anime-insert-form__button-group">
                  <button type="submit" className="anime-insert-form__submit-btn" disabled={loading}>
                    {loading ? 'Menyimpan ke Database...' : 'Simpan Anime ke Database'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* SIDEBAR COLUMN (Persis seperti Home, AnimeList, Genre) */}
          <div className="side-column">
            <div className="side-content">
              <h2>Web Anime</h2>
              <p>Kusonime</p>
              <a href="https://kusonime.com/" target="_blank" rel="noopener noreferrer">
                <img className="side-thumb" src="/gambar/kusonime.png" alt="Kusonime" />
              </a>
              <p>Otakudesu</p>
              <a href="https://otakudesu.best/" target="_blank" rel="noopener noreferrer">
                <img className="side-thumb" src="/gambar/otakudesu.png" alt="Otakudesu" />
              </a>
            </div>

            {sideSeasons.length > 0 && (
              <div className="side-content">
                <h2>SEASONS ANIME</h2>
                <div className="seasons-grid">
                  {sideSeasons.map((season, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="season-button"
                      onClick={() => navigate(`/?season=${encodeURIComponent(season)}`)}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {genresList.length > 0 && (
              <div className="side-content">
                <h2>GENRES ANIME</h2>
                <div className="genres-grid">
                  {genresList.slice(0, 24).map((genre) => (
                    <button
                      key={genre.id || genre.name}
                      type="button"
                      className="genre-button"
                      onClick={() => navigate(`/?genre=${encodeURIComponent(genre.name)}`)}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeInsertForm;
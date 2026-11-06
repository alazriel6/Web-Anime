import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import "../styles/jacobAdmin.css";
import "../styles/content.css";

export default function JacobAdmin() {
  const { isAuthenticated, adminUser, login, logout, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("jacob");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error || "Gagal login. Periksa kembali username & password.");
      } else {
        // Berhasil login, arahkan langsung ke halaman input anime
        navigate("/anime-insert");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat login");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="main-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "#fff", fontSize: "1.1rem" }}>Memeriksa sesi login Jacob...</p>
      </div>
    );
  }

  // JIKA SUDAH LOGIN SEBAGAI ADMIN JACOB
  if (isAuthenticated) {
    return (
      <div className="main-wrapper">
        <div className="container-main">
          <div className="jacob-dashboard-header">
            <div className="jacob-user-info">
              <div className="jacob-user-avatar">👑</div>
              <div className="jacob-user-details">
                <h3>Jacob (Administrator)</h3>
                <span>● Terautentikasi (JWT httpOnly Cookie Aktif)</span>
              </div>
            </div>
            <button className="jacob-btn-logout" onClick={logout}>
              🚪 Keluar / Logout
            </button>
          </div>

          <div className="jacob-quick-actions">
            <Link to="/anime-insert" className="jacob-action-card">
              <h4>➕ Form Tambah Anime</h4>
              <p>Tambah data anime baru ke database PostgreSQL lengkap dengan Genre & Musim rilis.</p>
            </Link>

            <Link to="/" className="jacob-action-card">
              <h4>🌐 Lihat Website Publik</h4>
              <p>Kembali ke beranda utama untuk melihat tampilan pengunjung umum.</p>
            </Link>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #1e293b",
            color: "#94a3b8",
            fontSize: "0.9rem",
            lineHeight: "1.6"
          }}>
            <h4 style={{ color: "#38bdf8", margin: "0 0 0.5rem 0" }}>🛡️ Catatan Keamanan Panel:</h4>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              <li>Menu "Add Anime" telah disembunyikan sepenuhnya dari pengunjung publik di Navbar.</li>
              <li>Sesi login menggunakan token JWT yang disimpan dalam <strong>httpOnly Cookie</strong> (kebal terhadap pencurian skrip XSS).</li>
              <li>Endpoint mutasi (tambah anime, genre, dan season) di backend diproteksi dengan verifikasi ketat identitas Jacob.</li>
              <li>Halaman ini hanya dapat diakses melalui link rahasia <code>/jacob</code>.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // JIKA BELUM LOGIN: TAMPILKAN FORM LOGIN RAHASIA
  return (
    <div className="main-wrapper">
      <div className="container-main">
        <div className="jacob-portal-wrapper">
          <div className="jacob-portal-header">
            <span className="jacob-badge">🔒 Restricted Area</span>
            <h1 className="jacob-portal-title">JACOB ADMIN PORTAL</h1>
            <p className="jacob-portal-subtitle">Silakan login untuk mengelola dan menambahkan anime</p>
          </div>

          {error && <div className="jacob-error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="jacob-form-group">
              <label htmlFor="admin-username">Username Administrator</label>
              <input
                id="admin-username"
                type="text"
                className="jacob-input"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="jacob-form-group">
              <label htmlFor="admin-password">Password Administrator</label>
              <div className="jacob-input-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="jacob-input"
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="jacob-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="jacob-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memverifikasi..." : "Masuk ke Panel Jacob"}
            </button>
          </form>

          <div className="jacob-footer-note">
            Diamankan dengan enkripsi JWT, httpOnly cookie &amp; perlindungan Brute-Force Rate Limiting.
          </div>
        </div>
      </div>
    </div>
  );
}


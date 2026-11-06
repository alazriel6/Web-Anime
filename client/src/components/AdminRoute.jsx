import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="main-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "#fff", fontSize: "1.2rem", textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}>🔒 Memeriksa hak akses Jacob Admin...</div>
          <div className="spinner" style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.2)",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Arahkan ke link rahasia /jacob jika belum login
    return <Navigate to="/jacob" state={{ from: location }} replace />;
  }

  return children;
}


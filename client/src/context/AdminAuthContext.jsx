import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminAuthContext = createContext(null);

const API_BASE_CANDIDATES = [
  "/api",
  "http://localhost:5000/api"
];

async function authFetch(endpoint, options = {}) {
  let lastError = null;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Periksa apakah admin sudah login melalui httpOnly cookie
  const checkAuth = useCallback(async () => {
    try {
      const res = await authFetch("/admin/me", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
          setIsAuthenticated(true);
          return true;
        }
      }
      setAdminUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (err) {
      setAdminUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (username, password) => {
    try {
      const res = await authFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login gagal");
      }

      setAdminUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authFetch("/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setAdminUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}


import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/common/hero.jsx";
import "./App.css";
import Navbar from "./components/common/navbar.jsx";
import Content from "./components/main/content.jsx";
import Footer from "./components/common/footer.jsx";
import Genre from "./components/main/genre.jsx";
import TahunRilis from "./components/main/tahun-rilis.jsx";
import AnimeList from "./components/main/animelist.jsx";
import About from "./components/main/about.jsx";
import AnimeInsertForm from "./components/AnimeInsertForm.jsx";
import JacobAdmin from "./components/JacobAdmin.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";

function App() {
  return (
    <AdminAuthProvider>
      <div className="bg"></div>
      <Hero />
      <Navbar />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/anime-list" element={<AnimeList />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/tahun-rilis" element={<TahunRilis />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Content />} />
        {/* Link Rahasia Masuk Admin Jacob */}
        <Route path="/jacob" element={<JacobAdmin />} />
        {/* Route Input Anime yang Diproteksi Khusus Admin */}
        <Route
          path="/anime-insert"
          element={
            <AdminRoute>
              <AnimeInsertForm />
            </AdminRoute>
          }
        />
        {/* Detail anime */}
        <Route path="/anime/:id" element={<Content />} />
      </Routes>
      <Footer />
    </AdminAuthProvider>
  );
}

export default App;

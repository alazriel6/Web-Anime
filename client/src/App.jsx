import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Hero from "./components/common/hero.jsx";
import "./App.css";
import Navbar from "./components/common/navbar.jsx";
import Content from "./components/main/content.jsx";
import Footer from "./components/common/footer.jsx";
import Genre from "./components/main/genre.jsx";
import TahunRilis from "./components/main/tahun-rilis.jsx";
import AnimeList from "./components/main/animelist.jsx";
import About from "./components/main/about.jsx";

function App() {
  return (
    <>
      <div className="bg bg1"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div>
      <div className="bg bg4"></div>
      <div className="bg bg5"></div>
      <div className="bg bg6"></div>
      <div className="bg bg7"></div>
      <Hero />
      <Navbar />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/anime-list" element={<AnimeList />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/tahun-rilis" element={<TahunRilis />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Content />} />

        {/* ⬇️ ini route baru untuk detail anime */}
        <Route path="/anime/:id" element={<Content />} /> {/* DETAIL ANIME */}
      </Routes>
      <Footer />
    </>
  );
}

export default App;

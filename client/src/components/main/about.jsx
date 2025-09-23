import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // ⬅️ tambahin Link
import "../../styles/about.css";

const About = () => {
  return (
    <div className="main-wrapper">
      <div className="container-main">
        <h1 className="main-title" >About Us</h1>
        <div className="content-wrapper">
          <div className="tahun-page">
            <div className="about">
              <p>Welcome to our Anime List application!</p>
              <p>
                Here you can find a comprehensive list of anime series and movies.
              </p>
              <p>Enjoy exploring the world of anime!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/footer.css";
import {
  FaWhatsapp, FaPhone, FaLocationArrow, FaEnvelope,
  FaFacebook, FaTwitter, FaReddit, FaTiktok,
  FaInstagram, FaGithub, FaYoutube
} from "react-icons/fa";
import { IoShareSocialSharp } from "react-icons/io5";

const Footer = () => {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);

  return (
    <>
      {/* Footer utama */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="row">

            {/* Customer Care */}
            <div className="footer-col">
              <h4>Customer Care</h4>
              <ul>
                <li><FaWhatsapp /> 081317868340 (WA Message Only)</li>
                <li><FaPhone /> 021 45784</li>
              </ul>
            </div>

            {/* Alamat */}
            <div className="footer-col">
              <h4>Alamat</h4>
              <ul>
                <li>
                  <FaLocationArrow /> Jl. Alam Parung Raya, Cibentang, 
                  Kec. Ciseeng, Kabupaten Bogor, Jawa Barat 16120
                </li>
              </ul>
            </div>

            {/* Email */}
            <div className="footer-col">
              <h4>Email Address</h4>
              <ul>
                <li><FaEnvelope /> JacobFrye@AlSpaceKomputer.com</li>
                <li><FaEnvelope /> Lazyboy801@gmail.com</li>
              </ul>
            </div>

            {/* Follow Us On dengan toggle */}
            <div className="footer-col">
              <h4>Follow Us On</h4>
              <ul className={`menu ${menuActive ? "active" : ""}`}>
                {/* Tombol toggle */}
                <div className="toggle" onClick={() => setMenuActive(!menuActive)}>
                  <IoShareSocialSharp />
                </div>

                {/* Ikon sosmed */}
    
                <li style={{ "--i": 1, "--clr": "#25d366" }}>
                  <a href="#"><FaWhatsapp /></a>
                </li>
                <li style={{ "--i": 2, "--clr": "#1da1f2" }}>
                  <a href="#"><FaTwitter /></a>
                </li>
                <li style={{ "--i": 3, "--clr": "#ff4500" }}>
                  <a href="#"><FaReddit /></a>
                </li>
                <li style={{ "--i": 4, "--clr": "#0a66c2" }}>
                  <a href="#"><FaTiktok /></a>
                </li>
                <li style={{ "--i": 5, "--clr": "#c32aa3" }}>
                  <a href="#"><FaInstagram /></a>
                </li>
                <li style={{ "--i": 6, "--clr": "#333" }}>
                  <a href="#"><FaGithub /></a>
                </li>
                <li style={{ "--i": 7, "--clr": "#ff0000" }}>
                  <a href="https://www.youtube.com/channel/UCLOakCCjldFGICnQaeArxRA" 
                     target="_blank" rel="noopener noreferrer">
                    <FaYoutube />
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

      {/* Footer bawah */}
      <div className="fixed-footer">
        <div className="container">
          <p>Copyright © 2023 - AlSpaceKomputer. All Rights Reserved</p>
          <button onClick={() => navigate("/about")}>About Us</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </div>
    </>
  );
};

export default Footer;

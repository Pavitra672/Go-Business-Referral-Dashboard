import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">Go Business</span>

        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#about" className="footer-link">
            About
          </a>
          <a href="#privacy" className="footer-link">
            Privacy
          </a>
        </nav>

        <p className="footer-copy">© 2024 Go Business</p>
      </div>
    </footer>
  );
}

export default Footer;

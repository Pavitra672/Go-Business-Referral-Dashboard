import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Go Business home">
          Go Business
        </Link>

        <nav className="navbar-nav" aria-label="Primary navigation">
          <Link to="/" className="navbar-link">
            Home
          </Link>
        </nav>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
          aria-label="Log out of your account"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;

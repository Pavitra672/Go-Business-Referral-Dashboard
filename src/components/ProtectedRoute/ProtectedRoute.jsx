import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Guards a route: renders children when a jwt_token cookie exists,
// otherwise redirects the visitor to the login page.
function ProtectedRoute({ children }) {
  const token = Cookies.get('jwt_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

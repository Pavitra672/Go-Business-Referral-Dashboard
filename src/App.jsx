import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

import Login from './pages/Login/Login.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ReferralDetails from './pages/ReferralDetails/ReferralDetails.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';

// Wraps authenticated pages with a shared Navbar + Footer layout.
function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

// Redirects already-authenticated users away from the login page.
function PublicOnlyRoute({ children }) {
  const token = Cookies.get('jwt_token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/referral/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ReferralDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Not Found is public and must NOT be wrapped in ProtectedRoute */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

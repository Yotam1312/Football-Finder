import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { FanBasePage } from './pages/FanBasePage';
import { TeamFanBasePage } from './pages/TeamFanBasePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WelcomePage } from './pages/WelcomePage';
import { ProfilePage } from './pages/ProfilePage';
import { ContactPage } from './pages/ContactPage';
import { StadiumGuidePage } from './pages/StadiumGuidePage';
import { NotFoundPage } from './pages/NotFoundPage';

// AnimatePresence enables smooth page transition animations.
// key={location.pathname} tells Framer Motion when a route change happens.
export default function App() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/results"   element={<ResultsPage />} />
          <Route path="/match/:id" element={<MatchDetailPage />} />
          {/* FanBase hub — all 3 steps handled by one component via useParams */}
          <Route path="/fanbase"                    element={<FanBasePage />} />
          <Route path="/fanbase/:country"           element={<FanBasePage />} />
          <Route path="/fanbase/:country/:league"   element={<FanBasePage />} />
          {/* Team FanBase page — /fanbase/team/:teamId is a static prefix "team", beats dynamic :country */}
          <Route path="/fanbase/team/:teamId"       element={<TeamFanBasePage />} />
          {/* Auth pages — Phase 9 */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/welcome"  element={<WelcomePage />} />
          <Route path="/profile"  element={<ProfilePage />} />
          {/* Stadium Guide hub — all 3 steps handled by one component via useParams */}
          <Route path="/stadiums"                    element={<StadiumGuidePage />} />
          <Route path="/stadiums/:country"           element={<StadiumGuidePage />} />
          <Route path="/stadiums/:country/:league"   element={<StadiumGuidePage />} />
          {/* Redirect old Transport page URL to new Stadium Guide hub */}
          <Route path="/transport" element={<Navigate to="/stadiums" replace />} />
          {/* Static info pages — Phase 5 polish */}
          <Route path="/contact"   element={<ContactPage />} />
          {/* Catch-all — must be the last route; shows 404 page for unknown URLs */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
      {/* BottomNav is outside AnimatePresence so it does not animate on route changes */}
      <BottomNav />
    </>
  );
}

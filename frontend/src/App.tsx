import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchDetailPage } from './pages/MatchDetailPage';

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
          {/* Phase 3 stub — MATCH-06 links here; real page built in Phase 3 */}
          <Route
            path="/fanbase/team/:teamId"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800">FanBase Coming Soon</h1>
                  <p className="text-gray-500 mt-2">Community features launch in Phase 3.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

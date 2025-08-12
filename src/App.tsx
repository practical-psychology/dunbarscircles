import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RadialPage from "./pages/RadialPage";
import LevelsPage from "./pages/LevelsPage";
import NetworkPage from "./pages/NetworkPage";
import DigitalPage from "./pages/DigitalPage";
import LifecyclePage from "./pages/LifecyclePage";
import DashboardPage from "./pages/DashboardPage";
import FirebaseTestPage from "./pages/FirebaseTestPage";
import SitemapPage from "./pages/SitemapPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <div className="min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/radial" element={<RadialPage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/digital" element={<DigitalPage />} />
        <Route path="/lifecycle" element={<LifecyclePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/firebase-test" element={<FirebaseTestPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

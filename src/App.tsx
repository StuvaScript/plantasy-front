import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import PlantsPage from "./pages/PlantsPage";
import PlantDetailPage from "./pages/PlantDetailPage";
import PageNotFound from "./pages/PageNotFound";
import ExplorerPage from "./pages/ExplorePage";
import PrivateRoute from "./routes/PrivateRoute";
import PlantIdentifierPage from "./pages/PlantIdentifierPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected */}
        <Route element={<PrivateRoute />}>
          <Route path="/identify" element={<PlantIdentifierPage />} />
          <Route path="/plants" element={<PlantsPage />} />
          <Route path="/plants/:id" element={<PlantDetailPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
        </Route>

        {/* 404 */}
        <Route path="/page-not-found" element={<PageNotFound />} />
        <Route path="*" element={<Navigate to="/page-not-found" replace />} />
      </Routes>
    </>
  );
}

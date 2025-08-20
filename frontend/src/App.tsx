import { Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/RouteGuard"; // Uncomment and implement this
import InputPage from "./pages/InputPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import UserLetters from "./pages/UserLetters";
import SubscriptionPage from "./pages/SubscriptionPage";
import SuccessPage from "./pages/Succes";
import CancelSubscriptionPage from "./pages/SettingsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { useAuth } from "./context/authContext";
import NotFound from "./pages/NotFound";

function App() {
  const { session } = useAuth();

  return (
    <div>
      <Toaster />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <InputPage />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route
          path="/letters"
          element={
            <ProtectedRoute>
              <UserLetters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="premium-user">
              <CancelSubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <SuccessPage />
            </ProtectedRoute>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

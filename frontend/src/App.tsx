import { Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/RouteGuard";
import InputPage from "./pages/InputPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import UserLetters from "./pages/UserLetters";

function App() {
  // const upgradeToPremium = async (userId: string) => {
  //   await supabase
  //     .from("profiles")
  //     .update({ role: "premium-user" })
  //     .eq("id", userId);

  //   // Refresh session to update role
  //   await supabase.auth.refreshSession();
  // };

  return (
    <div>
      <Toaster />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze"
          element={
            // <ProtectedRoute>
            <InputPage />
            // </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route
          path="/letters"
          element={
            // <ProtectedRoute>
            <UserLetters />
            // </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

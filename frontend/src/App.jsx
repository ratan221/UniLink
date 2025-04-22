import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import GuestRoute from "./components/routes/GuestRoute";
import AuthRoute from "./components/routes/AuthRoute";
import { Toaster } from "react-hot-toast";
import Home from "./pages/admin/Home";
import CertificatesApproval from "./pages/admin/CertificatesApproval";
import UserProvider from "./providers/userProvider";
import Profile from "./pages/admin/Profile";
import Events from "./pages/Events";
import Analytics from "./pages/admin/Analytics";
import Loading from "./utils/LoaderUtils";
import SkillsApproval from "./pages/admin/SkillsApproval";
import MyConnections from "./pages/admin/MyConnections";

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 500); 

    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) return <Loading />;

  return (
    <UserProvider>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Authenticated User Routes */}
        <Route element={<Layout />}>
          <Route element={<AuthRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="all-connections" element={<MyConnections />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="certifications-approval" element={<CertificatesApproval />} />
          <Route path="skills-approval" element={<SkillsApproval />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<LoginPage />} />
      </Routes>

      <Toaster />
    </UserProvider>
  );
}

export default App;

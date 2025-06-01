import Navbar from "./components/Navbar";
import ChatDrawer from "./components/ChatDrawer";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import FollowingPage from "./pages/FollowingPage";
import NotificationsPage from "./pages/NotificationsPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import UserEventsPage from "./pages/UserEventsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BadgeShopPage from "./pages/BadgeShopPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ChatPage from "./pages/ChatPage";
import MarketplacePage from "./pages/MarketplacePage";
import MarketplaceItemDetailPage from "./pages/MarketplaceItemDetailPage";
import MyMarketplaceItemsPage from "./pages/MyMarketplaceItemsPage";
import FavoritesPage from "./pages/FavoritesPage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/profile/events" element={authUser ? <UserEventsPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/following" element={authUser ? <FollowingPage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={authUser ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/events" element={authUser ? <EventsPage /> : <Navigate to="/login" />} />
        <Route path="/events/:eventId" element={authUser ? <EventDetailPage /> : <Navigate to="/login" />} />
        <Route path="/leaderboard" element={authUser ? <LeaderboardPage /> : <Navigate to="/login" />} />
        <Route path="/badges" element={authUser ? <BadgeShopPage /> : <Navigate to="/login" />} />
        <Route path="/marketplace" element={authUser ? <MarketplacePage /> : <Navigate to="/login" />} />
        <Route path="/marketplace/items/:id" element={authUser ? <MarketplaceItemDetailPage /> : <Navigate to="/login" />} />
        <Route path="/marketplace/item/:id" element={authUser ? <MarketplaceItemDetailPage /> : <Navigate to="/login" />} />
        <Route path="/marketplace/my-items" element={authUser ? <MyMarketplaceItemsPage /> : <Navigate to="/login" />} />
        <Route path="/marketplace/favorites" element={authUser ? <FavoritesPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={authUser && authUser.isAdmin ? <AdminDashboardPage /> : <Navigate to="/" />} />
        <Route path="*" element={<div className="min-h-screen pt-20 pb-10 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="mb-8">The page you're looking for doesn't exist or you don't have access to it.</p>
            <button onClick={() => window.history.back()} className="btn btn-primary mr-2">Go Back</button>
            <a href="/" className="btn btn-outline">Home Page</a>
          </div>
        </div>} />
      </Routes>

      {/* Show chat drawer on all pages if user is logged in, except on the Chat page */}
      {authUser && location.pathname !== '/chat' && <ChatDrawer />}

      <Toaster />
    </div>
  );
};
export default App;

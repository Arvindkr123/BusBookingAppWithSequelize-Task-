import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import { RequireAuth } from "./components/RouteGuards";
import AdminLayout from "./components/admin/AdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBuses from "./pages/admin/AdminBuses";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminUsers from "./pages/admin/AdminUsers";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Preparing your Wayfare experience…" />;
  }

  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<AuthPage mode="login" />} path="/login" />
      <Route element={<AuthPage mode="signup" />} path="/signup" />
      <Route
        element={
          <RequireAuth>
            <MyBookingsPage />
          </RequireAuth>
        }
        path="/account/bookings"
      />
      <Route
        element={
          <RequireAuth admin>
            <AdminLayout />
          </RequireAuth>
        }
        path="/admin"
      >
        <Route element={<AdminOverview />} index />
        <Route element={<AdminBuses />} path="buses" />
        <Route element={<AdminUsers />} path="users" />
        <Route element={<AdminBookings />} path="bookings" />
        <Route element={<AdminPayments />} path="payments" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

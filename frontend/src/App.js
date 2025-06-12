import { Navigate, Route, Routes } from "react-router-dom";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Browse from "./pages/Browse";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import Login from "./pages/Login";
import MovieDetail from "./pages/MovieDetail";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Search from "./pages/Search";
import SeriesDetail from "./pages/SeriesDetail";
import { checkAuth } from "./store/slices/authSlice";

// Pages











function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Protected routes with layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse/:type" element={<Browse />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
        <Route path="/search" element={<Search />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

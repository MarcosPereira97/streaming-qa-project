import { Navigate, Outlet, useLocation } from "react-router-dom";

import React from "react";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

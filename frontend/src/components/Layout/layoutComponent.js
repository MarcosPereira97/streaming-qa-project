import Footer from "./Footer";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import React from "react";

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

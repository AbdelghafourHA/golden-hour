import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import useAuth from "./stores/auth.store";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/Loading";

const App = () => {
  const { checkAuth, isAuthenticated } = useAuth();

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitialLoading(false);
    };
    initAuth();
  }, []);

  if (isInitialLoading) return <LoadingSpinner />;

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/hadashboard"
          element={!isAuthenticated ? <Login /> : <Dashboard />}
        />
      </Routes>
    </>
  );
};

export default App;

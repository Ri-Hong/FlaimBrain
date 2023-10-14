import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';

// This function checks if a user is authenticated and returns the appropriate component
const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token'); // add your authentication check

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, return the requested page
  return <>{children}</>;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedPage><Home /></ProtectedPage>} />
      </Routes>
    </Router>
  );
}

export default App;

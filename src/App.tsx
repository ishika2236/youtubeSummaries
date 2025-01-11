import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NhostProvider } from '@nhost/react';
import { Toaster } from 'react-hot-toast';
import { nhost } from './lib/nhost';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="bottom-right" />
        </div>
      </BrowserRouter>
    </NhostProvider>
  );
}

export default App;
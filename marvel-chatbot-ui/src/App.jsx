import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HeroSelection from './components/HeroSelection';
import ChatInterface from './components/ChatInterface';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('marvelChatToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/heroes" element={
            <ProtectedRoute>
              <HeroSelection />
            </ProtectedRoute>
          } />
          <Route path="/chat/:hero" element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
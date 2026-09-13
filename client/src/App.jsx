import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import MockInterview from './pages/MockInterview';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper font-sans text-slate-900 bg-slate-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/interview" element={<MockInterview />} />


          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

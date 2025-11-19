import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import DispositionPage from './pages/DispositionPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/disposition" element={<DispositionPage />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

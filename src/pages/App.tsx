import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from '../components/navBar';
import PrevisionPlage from '../components/PrevisionPlage'; 
import Home from '../components/home';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lette-blanche" element={<PrevisionPlage plage="lette-blanche" />} />
        <Route path="/biscarosse" element={<PrevisionPlage plage="biscarosse" />} />
        {/* Ajoutez d'autres routes selon vos besoins */}
      </Routes>
    </Router>
  );
}



export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from '../components/NavBar';
import BeachForecast from '../components/BeachForecast';
import Home from '../components/Home';
import Footer from '../components/Footer';
import Beach from '../interfaces/Beach';
import { WindForecastProvider } from '../context/WindForecastContext';
import { WaveForecastProvider } from '../context/WaveForecastContext';
import ScrollToTop from '@/components/ScrollToTop';

const letteBlanche: Beach = {
  nom: 'La lette Blanche',
  latitude: 43.902658,
  longitude: -1.377651
};

const biscarosse: Beach = {
  nom: 'Biscarosse',
  latitude: 44.446321,
  longitude: -1.256297
};

function App() {
  return (
    <WindForecastProvider>
      <WaveForecastProvider>
        <Router basename="/infoRisquesBaignade">
          <ScrollToTop />
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lette-blanche" element={<BeachForecast beach={letteBlanche} />} />
            <Route path="/biscarrosse" element={<BeachForecast beach={biscarosse} />} />
          </Routes>
          <Footer />
        </Router>
      </WaveForecastProvider>
    </WindForecastProvider>
  );
}

export default App;
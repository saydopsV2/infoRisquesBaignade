import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from '../components/navBar';
import BeachForecast from '../components/BeachForecast'; 
import Home from '../components/home';
import allDataPlotImg from '/public/img/vue_saison.jpg';
import forecastPlotImg from '/public/img/vue_semaine.jpg';
import Footer from '../components/Footer';
import Beach from '../interface/Beach';
import { WindForecastProvider } from '../context/WindForecastContext';

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
      <Router basename="/infoBaines">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lette-blanche" element={<BeachForecast beach={letteBlanche} forecastPlot={forecastPlotImg} allDataPlot={allDataPlotImg} />} />
          <Route path="/biscarrosse" element={<BeachForecast beach={biscarosse} forecastPlot={forecastPlotImg} allDataPlot={allDataPlotImg} />} />
        </Routes>
        <Footer />
      </Router>
    </WindForecastProvider>
  );
}

export default App;

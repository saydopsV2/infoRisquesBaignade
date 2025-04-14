import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from '../components/navBar';
import BeachForecast from '../components/BeachForecast'; 
import Home from '../components/home';
import allDataPlotImg from '/public/img/vue_saison.jpg';
import forecastPlotImg from '/public/img/vue_semaine.jpg';


function App() {
  return (
    <Router basename="/infoBaines">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lette-blanche" element={<BeachForecast beach="lette-blanche" forecastPlot={forecastPlotImg} allDataPlot={allDataPlotImg} />} />
        <Route path="/biscarosse" element={<BeachForecast beach="biscarosse" forecastPlot={forecastPlotImg} allDataPlot={allDataPlotImg}/>} />
      </Routes>
    </Router>
  );
}

export default App;

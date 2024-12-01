import './App.css';
import HeroTestPage from './pages/HeroTestPage';
import HeroAnimation from './components/HeroAnimation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DotData from './data/DotData';

function App() {
  return (
    <Router> 
      <div className="App">
        <Routes>
          <Route path="/" element={<HeroTestPage />} />
          <Route path="/hero" element={<HeroAnimation />} />
          <Route path="/dotdata" element={<DotData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

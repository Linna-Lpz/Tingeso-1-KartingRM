import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Home from './components/Home';
import KartBookingForm from './components/KartBookingForm';
import Navegate from "./components/Navegate"

function App() {
  return (
      <Router>
          <div className="container">
          <Navegate></Navegate>
            <Routes>
              <Route path="/home" element={<Home/>} />
              <Route path='/kartBookingForm' element={<KartBookingForm/>} />
            </Routes>
          </div>
      </Router>
  );
}

export default App
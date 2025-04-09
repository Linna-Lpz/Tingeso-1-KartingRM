import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import ClientRegister from './components/ClientRegister';
import Home from './components/Home';
import KartBookingForm from './components/KartBookingForm';
import Navegate from './components/Navegate';
import RackWeekly from './components/RackWeekly';

function App() {
  return (
      <Router>
          <div className="container">
          <Navegate></Navegate>
            <Routes>
              <Route path="/home" element={<Home/>} />
              <Route path='/kartBookingForm' element={<KartBookingForm/>} />
              <Route path="/clientRegister" element={<ClientRegister/>} />
              <Route path="/rackWeekly" element={<RackWeekly/>} />
            </Routes>
          </div>
      </Router>
  );
}

export default App
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "./assets/pages/SignUp";
import Login from "./assets/pages/Login";
import LandingPage from "./assets/pages/Landing";
import Dashboard from "./assets/pages/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard/>} />
       
      </Routes>
    </Router>
  );
}

export default App;

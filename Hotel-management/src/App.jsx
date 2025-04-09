
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Component from "./Screen/login";
import AdminDashboard from "./Screen/admin";
import ReceptionistDashboard from "./Screen/receptionist";
import AccountantDashboard from "./Screen/accountant";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route for Home */}
        <Route path="/" element={<Component />} />
        
        <Route path="/Screen/login" element={<Component />} />
        <Route path="/Screen/admin" element={<AdminDashboard />} />
        <Route path="/Screen/receptionist" element={<ReceptionistDashboard />} />
        <Route path="/Screen/accountant" element={<AccountantDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

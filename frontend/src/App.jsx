import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // Schermata di login
import Home from "./pages/Home";   // Schermata home
import ProtectedRoute from "./components/ProtectedRoute"; // Per proteggere le pagine


function App() {

  return (
    <Router>
      <Routes>
        {/* Rotta pubblica per il login */}
        <Route path="/" element={<Login />} />

        {/* Rotta protetta per la home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App

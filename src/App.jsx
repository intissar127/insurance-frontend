import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard'; // On va le créer juste après
import ClientDashboard from './components/ClientDashboard'; // On va le créer juste après
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route publique */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        

        {/* Routes protégées (accessibles uniquement si connecté) */}
        <Route 
          path="/admindashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        // Dans App.jsx, vérifie que les chemins correspondent EXACTEMENT
<Route 
  path="/ClientDashboard" 
  element={
    <ProtectedRoute>
      <ClientDashboard />
    </ProtectedRoute>
  } 
/>
         {/* <Route path="/register" element={<Register />} /> */}

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/Register" />} />
      </Routes>
    </Router>
  );
}

export default App;
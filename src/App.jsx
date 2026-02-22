import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Home from './pages/client/Home'
import Orders from './pages/client/Orders'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

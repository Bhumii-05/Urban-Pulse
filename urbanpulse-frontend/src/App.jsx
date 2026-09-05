import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CitizenDashboard from './pages/CitizenDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ReportConcern from './pages/ReportConcern'
import Profile from './pages/Profile'
import WorkerDashboard from './pages/WorkerDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/citizen" element={<CitizenDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/report-concern" element={<ReportConcern />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/worker" element={<WorkerDashboard />} />
    
    </Routes>
  )
}
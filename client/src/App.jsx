import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from "react"
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/ProjectList'));
const Contact = lazy(() => import('./pages/AskMe'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Admin = lazy(() => import('./pages/Admin'));
const EditProject = lazy(() => import('./pages/EditProject'));
import './index.css'
import FallbackLoading from './components/FallbackLoading';

function App() {

  return (

      <div className='flex flex-col min-h-screen'>
        <Navbar />
          <main className='flex-grow p-4'>
            <Suspense fallback={<FallbackLoading />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/adminlogin" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/projects/:id/edit" element={<EditProject />} />
              </Routes>
            </Suspense>
          </main>
        <Footer />
      </div>
  );
}

export default App;

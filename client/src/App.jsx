import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from "react"
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Articles = lazy(() => import('./pages/ArticleList'));
const Contact = lazy(() => import('./pages/AskMe'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Admin = lazy(() => import('./pages/Admin'));
const EditArticle = lazy(() => import('./pages/EditArticle'));
const Sitout = lazy(() => import('./pages/Sitout'));
const PostArticle = lazy(() => import('./pages/PostArticle'));
import './index.css'
import FallbackLoading from './components/FallbackLoading';

function App() {

  return (

      <div className='flex flex-col min-h-screen'>
        <Navbar />
          <main className='grow p-4'>
            <Suspense fallback={<FallbackLoading />}>
              <Routes>
                <Route path="/" element={<Sitout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/adminlogin" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/postarticle" element={<PostArticle />} />
                <Route path="/user/articles/:id/edit" element={<EditArticle />} />
              </Routes>
            </Suspense>
          </main>
        <Footer />
      </div>
  );
}

export default App;

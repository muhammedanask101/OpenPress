import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const ViewArticle = lazy(() => import('./pages/ViewArticle'));
import './index.css'
import FallbackLoading from './components/FallbackLoading';
import { useSelector } from 'react-redux';

function App() {

  const { user, isLoading } = useSelector(state => state.user);
  const { admin } = useSelector(state => state.admin);
   
  return (

      <div className='flex flex-col min-h-screen'>
        <Navbar />
          <main className='grow p-4'>
            <Suspense fallback={<FallbackLoading />}>
              <Routes>
                <Route path="/" element={isLoading ? null : user ? <Navigate to="/home" replace/> : <Sitout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={user ? <Home /> : <Navigate to="/login" replace/>} />
                <Route path="/articles" element={user ? <Articles /> : <Navigate to="/login" replace/>} />
                <Route path="/contact" element={user ? <Contact /> : <Navigate to="/login" replace/>} />
                <Route path="/adminlogin" element={<AdminLogin />} />
                <Route path="/admin" element={admin ? <Admin /> : <Navigate to="/adminlogin" replace/>} />
                <Route path="/postarticle" element={<PostArticle />} />
                <Route path="/user/articles/:id/edit" element={<EditArticle />} />
                <Route path="/articles/:slug" element={<ViewArticle />} />
                <Route path="/articles/slug/:slug/edit" element={<EditArticle />} />
              </Routes>
            </Suspense>
          </main>
        <Footer />
      </div>
  );
}

export default App;

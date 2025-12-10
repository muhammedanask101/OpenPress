import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutAdmin, reset } from '../slices/adminSlice';
import { logoutUser } from '../slices/userSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { admin } = useSelector(state => state.admin);
  const { user } = useSelector(state => state.user);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    dispatch(reset());
    dispatch(logoutUser());
    dispatch(reset());
    setIsOpen(false);
    navigate("/adminlogin");
  };

  const handleUserLogout = () => {
    dispatch(logoutUser());
    dispatch(reset());
    if(admin){
      dispatch(logoutAdmin());
      dispatch(reset());
    }
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white text-black p-3 md:p-6 border-b border-black md:border-b-2">
      <div className="flex justify-between items-center">
        <div className="md:font-extrabold font-bold text-lg md:ml-4 md:text-2xl tracking-wide">
          <Link to="/">Kerala Muslims</Link>
        </div>

        <div className="hidden md:flex mr-4 text-2xl font-bold space-x-4">
          { user && <Link to="/home" className="hover:text-blue-700">Home</Link> }
          { user && <Link to="/articles" className="hover:text-blue-700">Articles</Link> }
          { user && <Link to="/contact" className="hover:text-blue-700">Contact</Link> }
          { !user && (location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && <Link to="/" className="hover:text-blue-700 font-bold">Home</Link>}
          { !user && location.pathname.startsWith("/login") && <Link to="/register" className="hover:text-blue-700 font-bold">Register</Link> }
          { !user && location.pathname.startsWith("/register") && <Link to="/login" className="hover:text-blue-700 font-bold">Login</Link> }
          { !user && location.pathname.startsWith("/") && !(location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && <Link to="/login" className="hover:text-blue-700 font-bold">Login</Link> }
          { !user && location.pathname.startsWith("/") && !(location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && <Link to="/register" className="hover:text-blue-700 font-bold">Register</Link> }
          {user && admin && !(location.pathname.startsWith("/admin")) &&
          <Link to="/admin" className="hover:text-yellow-500">Admin</Link>}
          {admin && location.pathname.startsWith("/admin") && 
          ( <button onClick={handleLogout} className='hover:text-red-500 transition'>Logout</button> )}
          {user && !(location.pathname.startsWith("/admin")) &&
          ( <button onClick={handleUserLogout} className='hover:text-red-500 transition'>Logout</button> )}
        </div>

        <div className="md:hidden text-md mr-2">
          <div className='space-x-2'>
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen && <X size={24} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)}>
              {!isOpen && user && <Menu size={24} />}
            </button>
            {!isOpen && !user && (location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && <Link to="/" className="hover:text-cyan-50 font-bold">Home</Link>}
            {!isOpen && !user && location.pathname.startsWith("/login") && <Link to="/register" className="hover:text-cyan-50 font-bold">Register</Link>}
            {!isOpen && !user && location.pathname.startsWith("/register") && <Link to="/login" className="hover:text-cyan-50 font-bold">Login</Link>}
            {!isOpen && !user && location.pathname.startsWith("/") && !(location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && <Link to="/login" className="hover:text-cyan-50 font-bold">Login</Link>}
            {!isOpen && !user && location.pathname.startsWith("/") && !(location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && <Link to="/register" className="hover:text-cyan-50 font-bold">Register</Link>}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden flex flex-col mt-2 text-[14px] space-y-2">
          <Link to="/home" className="hover:text-cyan-50" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/articles" className="hover:text-cyan-50" onClick={() => setIsOpen(false)}>Articles</Link>
          <Link to="/contact" className="hover:text-cyan-50" onClick={() => setIsOpen(false)}>Contact</Link>
          {user && admin && !(location.pathname.startsWith("/admin")) &&
            <Link to="/admin" className="hover:text-cyan-50">Admin</Link>}
          {admin && location.pathname.startsWith("/admin") && 
            ( <button onClick={handleLogout} className='text-left hover:text-red-500 transition'>Logout</button> )}
          {user && !(location.pathname.startsWith("/admin")) &&
            ( <button onClick={handleUserLogout} className='text-left hover:text-red-500 transition'>Logout</button> )}
        </div>
      )}
    </nav>
  );
};


export default Navbar;


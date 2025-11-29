import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, reset } from '../slices/authSlice';
import { userLogout } from '../slices/userSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { admin } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.users);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    dispatch(userLogout());
    dispatch(reset());
    navigate("/adminlogin");
  };

  const handleUserLogout = () => {
    dispatch(userLogout());
    dispatch(reset());
    if(admin){
      dispatch(logout());
      dispatch(reset());
    }
    navigate("/login");
  };

  return (
    <nav className="bg-black text-amber-100 p-3 md:p-6 shadow-md/80 shadow-blue-300">
      <div className="flex justify-between items-center">
        <div className="font-bold text-[16px] md:text-[22px] tracking-wide">
          Kerala Muslims
        </div>

        <div className="hidden md:flex text-[22px] space-x-4">
          { user && <Link to="/" className="hover:text-cyan-50">Home</Link> }
          { user && <Link to="/articles" className="hover:text-cyan-50">Articles</Link> }
          { user && <Link to="/contact" className="hover:text-cyan-50">Contact</Link> }
          { !user && location.pathname.startsWith("/login") && <Link to="/register" className="hover:text-cyan-50 font-bold">Register</Link> }
          { !user && location.pathname.startsWith("/register") && <Link to="/login" className="hover:text-cyan-50 font-bold">Login</Link> }
          {user && admin && !(location.pathname.startsWith("/admin")) &&
          <Link to="/admin" className="hover:text-cyan-50">Admin</Link>}
          {admin && location.pathname.startsWith("/admin") && 
          ( <button onClick={handleLogout} className='hover:text-red-500 transition'>Logout</button> )}
          {user && !(location.pathname.startsWith("/admin")) &&
          ( <button onClick={handleUserLogout} className='hover:text-red-500 transition'>Logout</button> )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden flex flex-col mt-2 text-[14px] space-y-2">
          <Link to="/" className="hover:text-cyan-50" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/articles" className="hover:text-cyan-50" onClick={() => setIsOpen(false)}>Articles</Link>
          <Link to="/contact" className="hover:text-cyan-50" onClick={() => setIsOpen(false)}>Contact</Link>
          {admin && location.pathname.startsWith("/admin") && 
          ( <button onClick={handleLogout} className='text-left hover:text-red-500 transition'>Logout</button> )}
        </div>
      )}
    </nav>
  );
};


export default Navbar;


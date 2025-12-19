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

  /* -------- ACTIVE PAGE HELPERS (ADDED) -------- */
  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const activeClass = "text-blue-700 font-bold";
  const inactiveClass = "hover:text-blue-700";
  /* -------------------------------------------- */

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
    if (admin) {
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

        {/* ---------------- DESKTOP ---------------- */}
        <div className="hidden md:flex mr-4 text-2xl font-bold space-x-4">
          {user && (
            <>
              <Link to="/home" className={isActive("/home") ? activeClass : inactiveClass}>
                Home
              </Link>
              <Link to="/articles" className={isActive("/articles") ? activeClass : inactiveClass}>
                Articles
              </Link>
              <Link to="/contact" className={isActive("/contact") ? activeClass : inactiveClass}>
                Contact
              </Link>
            </>
          )}

          {!user && (location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && (
            <Link to="/" className={isActive("/") ? activeClass : inactiveClass}>
              Home
            </Link>
          )}

          {!user && location.pathname.startsWith("/login") && (
            <Link to="/register" className={isActive("/register") ? activeClass : inactiveClass}>
              Register
            </Link>
          )}

          {!user && location.pathname.startsWith("/register") && (
            <Link to="/login" className={isActive("/login") ? activeClass : inactiveClass}>
              Login
            </Link>
          )}

          {!user && location.pathname.startsWith("/") &&
            !(location.pathname.startsWith("/login") || location.pathname.startsWith("/register")) && (
              <>
                <Link to="/login" className={isActive("/login") ? activeClass : inactiveClass}>
                  Login
                </Link>
                <Link to="/register" className={isActive("/register") ? activeClass : inactiveClass}>
                  Register
                </Link>
              </>
            )}

          {user && admin && !location.pathname.startsWith("/admin") && (
            <Link to="/admin" className={isActive("/admin") ? activeClass : "hover:text-yellow-500"}>
              Admin
            </Link>
          )}

          {admin && location.pathname.startsWith("/admin") && (
            <button onClick={handleLogout} className="hover:text-red-500 transition">
              Logout
            </button>
          )}

          {user && !location.pathname.startsWith("/admin") && (
            <button onClick={handleUserLogout} className="hover:text-red-500 transition">
              Logout
            </button>
          )}
        </div>

        {/* ---------------- MOBILE TOGGLE ---------------- */}
        <div className="md:hidden text-md mr-2">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ---------------- MOBILE MENU ---------------- */}
      {isOpen && (
        <div className="md:hidden flex flex-col mt-2 text-[14px] space-y-2">
          {user && (
            <>
              <Link
                to="/home"
                onClick={() => setIsOpen(false)}
                className={isActive("/home") ? "text-blue-700 font-bold" : "hover:text-cyan-50"}
              >
                Home
              </Link>
              <Link
                to="/articles"
                onClick={() => setIsOpen(false)}
                className={isActive("/articles") ? "text-blue-700 font-bold" : "hover:text-cyan-50"}
              >
                Articles
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={isActive("/contact") ? "text-blue-700 font-bold" : "hover:text-cyan-50"}
              >
                Contact
              </Link>
            </>
          )}

          {user && admin && !location.pathname.startsWith("/admin") && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={isActive("/admin") ? "text-blue-700 font-bold" : "hover:text-cyan-50"}
            >
              Admin
            </Link>
          )}

          {admin && location.pathname.startsWith("/admin") && (
            <button onClick={handleLogout} className="text-left hover:text-red-500 transition">
              Logout
            </button>
          )}

          {user && !location.pathname.startsWith("/admin") && (
            <button onClick={handleUserLogout} className="text-left hover:text-red-500 transition">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

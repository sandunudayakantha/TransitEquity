import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (user) {
      onLogout?.();
      navigate('/');
      return;
    }

    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TransitEquity logo" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold text-primary">TransitEquity</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="nav-link text-accent">Home</Link>
            <Link to="/gap-analysis" className="nav-link">Gap Analysis</Link>
            <Link to="/feedback" className="nav-link">Feedback Feed</Link>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <Link className="hidden sm:inline-flex text-sm font-medium text-secondary hover:text-primary transition-colors duration-200" to="/register">
                Register
              </Link>
            ) : null}
            <button className="btn btn-secondary py-2 px-4 flex items-center gap-2" type="button" onClick={handlePrimaryAction}>
              <User className="w-4 h-4" />
              <span>{user?.role === 'admin' ? 'Admin Panel' : user ? 'Logout' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

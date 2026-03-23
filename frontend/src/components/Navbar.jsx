import React from 'react';
import { Bus, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">TransitEquity</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="nav-link text-accent">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#issues" className="nav-link">Issues</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn btn-secondary py-2 px-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

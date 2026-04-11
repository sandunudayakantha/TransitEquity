import React from 'react';
import { Bus, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Bus className="w-6 h-6 text-accent" />
              <span className="text-xl font-bold text-primary">TransitEquity</span>
            </div>
            <p className="text-secondary leading-relaxed">
              Making public transportation more equitable and efficient through community feedback.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#issues" className="nav-link">Active Issues</a></li>
              <li><a href="#" className="nav-link">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="nav-link">Help Center</a></li>
              <li><a href="#" className="nav-link">Privacy Policy</a></li>
              <li><a href="#" className="nav-link">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Stay Connected</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-secondary text-sm">
            © {new Date().getFullYear()} TransitEquity. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-secondary">

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

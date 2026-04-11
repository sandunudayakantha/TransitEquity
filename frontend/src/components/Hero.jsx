import { ArrowRight, MessageSquareCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero_bg.png';

const Hero = ({ user }) => {
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    navigate('/login');
  };

  return (
    <section className="relative py-24 lg:py-40 overflow-hidden bg-white">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-accent text-sm font-medium mb-8">
            <MessageSquareCheck className="w-4 h-4" />
            <span>Empowering Commuters Everywhere</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-primary leading-tight mb-8">
            Better Transit for <br />
            <span className="text-accent underline decoration-4 underline-offset-8">Every Community</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-secondary mb-12 leading-relaxed">
            Report transportation issues, suggest improvements, and help build a more equitable transit system in your area. Your feedback drives real change.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn btn-primary w-full sm:w-auto px-8 py-4 text-lg gap-2" type="button" onClick={handlePrimaryAction}>
              {user?.role === 'admin' ? 'Open Admin Panel' : user ? 'View Community Feed' : 'Login to Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-4 text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95" 
              type="button" 
              onClick={() => navigate('/gap-analysis')}
            >
              Analyze Gaps
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

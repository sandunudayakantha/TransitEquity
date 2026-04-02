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
              {user?.role === 'admin' ? 'Open Admin Panel' : 'Login to Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
            {!user ? (
              <button className="btn btn-secondary w-full sm:w-auto px-8 py-4 text-lg" type="button" onClick={() => navigate('/register')}>
                Create Account
              </button>
            ) : (
              <button className="btn btn-secondary w-full sm:w-auto px-8 py-4 text-lg">
                View Active Routes
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

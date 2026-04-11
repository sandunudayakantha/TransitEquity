import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import newsletterBg from '../assets/newsletter_bg.png';

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-grow">
        <Hero user={user} />
        <Features />

        <section
          className="relative py-24 border-y border-gray-100 overflow-hidden"
          style={{
            backgroundImage: `url(${newsletterBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gray-50/95 z-0"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

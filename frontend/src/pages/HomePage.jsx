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
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">Stay updated on transit improvements</h2>
              <p className="text-secondary text-lg mb-8 max-w-xl mx-auto">
                Join our newsletter to receive monthly reports on how your feedback is improving transportation in your area.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
                <button type="button" className="btn btn-primary whitespace-nowrap px-8">
                  Get Updates
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

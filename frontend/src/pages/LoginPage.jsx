import { useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, LogIn } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '', 
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/login`,
        formData,
        { withCredentials: true }
      );

      const session = {
        token: response.data.token,
        user: response.data.user,
      };

      onLogin(session);

      const destination = response.data.user.role === 'admin'
        ? '/admin'
        : location.state?.from?.pathname || '/';

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-white sm:px-6 lg:px-8 flex items-center">
      <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_40%),linear-gradient(135deg,_#0f172a,_#1e293b)] p-10 text-white shadow-xl">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            <Bus className="h-4 w-4" />
            TransitEquity access
          </div>
          <h1 className="mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Sign in to manage transit data and community feedback.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white sm:text-lg">
            Admins are redirected straight to the admin panel after login. Other users return to the public site.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-white">For admins</p>
              <p className="mt-3 text-sm text-white">Review pending users, manage transport data, and monitor system activity.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-white">For commuters</p>
              <p className="mt-3 text-sm text-white">Sign in to continue using the platform as more user-facing features are added.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-800 p-8 shadow-xl sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Account login</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Welcome back</h2>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 text-white">
              <LogIn className="h-6 w-6" />
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Email</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Password</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button className="btn btn-primary w-full justify-center py-3 text-base" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login to TransitEquity'}
            </button>
          </form>

          <p className="mt-6 text-sm text-white">
            Return to the <Link className="font-semibold text-white underline" to="/">home page</Link>.
          </p>
          <p className="mt-2 text-sm text-white">
            Need an account? <Link className="font-semibold text-white underline" to="/register">Register here</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;

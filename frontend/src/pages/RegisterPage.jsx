import { useState } from 'react';
import { Bus, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const roleOptions = [
  {
    value: 'user',
    label: 'Commuter',
    description: 'Public user account with immediate access after registration.',
  },
  {
    value: 'tOfficer',
    label: 'Transit Officer',
    description: 'Officer account for route and service management. Requires admin approval.',
  },
  {
    value: 'iOfficer',
    label: 'Infrastructure Officer',
    description: 'Officer account for facility management. Requires admin approval.',
  },
];

const RegisterPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post(
        '/api/auth/register',
        formData
      );

      if (response.data.token && response.data.user) {
        onLogin({
          token: response.data.token,
          user: response.data.user,
        });

        navigate(response.data.user.role === 'admin' ? '/admin' : '/', { replace: true });
        return;
      }

      setSuccessMessage(response.data.message || 'Registration successful. Please wait for admin approval.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-white sm:px-6 lg:px-8 flex items-center">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_35%),linear-gradient(135deg,_#020617,_#0f172a)] p-10 shadow-xl">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            <Bus className="h-4 w-4" />
            TransitEquity registration
          </div>
          <h1 className="mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Create your account to join the transit system.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white sm:text-lg">
            Commuters can start using the platform right away. Officer accounts are created as pending and can log in after admin approval.
          </p>

          <div className="mt-10 space-y-4">
            {roleOptions.map((option) => (
              <div key={option.value} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-white">{option.label}</p>
                <p className="mt-3 text-sm text-white">{option.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-800 p-8 shadow-xl sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Account registration</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Create account</h2>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 text-white">
              <UserPlus className="h-6 w-6" />
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Full name</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Email</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white">Password</span>
                <input
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white">Phone number</span>
                <input
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0771234567"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Address</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Optional address"
              />
            </label>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-white">Register as</legend>
              {roleOptions.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <input
                    className="mt-1"
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={handleChange}
                  />
                  <span>
                    <span className="block font-medium text-white">{option.label}</span>
                    <span className="mt-1 block text-sm text-slate-200">{option.description}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {error ? (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {successMessage}
              </div>
            ) : null}

            <button className="btn btn-primary w-full justify-center py-3 text-base" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Register with TransitEquity'}
            </button>
          </form>

          <p className="mt-6 text-sm text-white">
            Already have an account? <Link className="font-semibold text-white underline" to="/login">Login here</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;

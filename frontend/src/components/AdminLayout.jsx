import { Link, NavLink } from 'react-router-dom';
import {
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Map,
  MapPinned,
  MessageSquare,
  ShieldCheck,
  Ticket,
  TrainFront,
  Users,
} from 'lucide-react';

const sideNavItems = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: Users,
  },
  {
    label: 'Facilities',
    to: '/admin/facilities',
    icon: MapPinned,
  },
  {
    label: 'Manage Areas',
    to: '/admin/areas',
    icon: Map,
  },
  {
    label: 'Transport Management',
    to: '/admin/transports',
    icon: TrainFront,
  },
  {
    label: 'Gap Reports',
    to: '/admin/gap-reports',
    icon: ChartColumn,
  },
  {
    label: 'Service Desk',
    to: '/admin/service-desk',
    icon: Ticket,
  },
  {
    label: 'Community Feedback',
    to: '/admin/feedback',
    icon: MessageSquare,
  },
];

const AdminLayout = ({ user, onLogout, title, eyebrow, children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex">
      <aside className="border-b border-white/10 bg-slate-900 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-6 py-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">TransitEquity</p>
            <h1 className="mt-3 text-2xl font-bold">Admin Panel</h1>
            <p className="mt-3 text-sm text-slate-300">
              Manage operations, coverage, and community issues from one place.
            </p>
          </div>

          <nav className="mt-10 space-y-3">
            {sideNavItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-400/15 text-white ring-1 ring-sky-300/30'
                      : 'bg-white/0 text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
              <ShieldCheck className="h-4 w-4" />
              Admin access confirmed
            </div>
            <p className="mt-4 text-lg font-semibold">{user?.name}</p>
            <p className="mt-1 text-sm text-slate-300">Role: {user?.role}</p>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link className="btn btn-secondary w-full justify-center border-white/15 bg-white/5 text-white hover:bg-white/10" to="/">
              Home
            </Link>
            <button className="btn btn-primary w-full justify-center gap-2" type="button" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-300">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-bold">{title}</h2>
            </div>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 sm:inline-flex">
              Signed in as {user?.name}
            </span>
          </div>
        </header>

        <div className="px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

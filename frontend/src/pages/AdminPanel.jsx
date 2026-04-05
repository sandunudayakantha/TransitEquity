import { ChartColumn, MapPinned, ShieldCheck, Users } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const adminCards = [
  {
    title: 'User approvals',
    description: 'Approve officer accounts and keep role access under control.',
    icon: Users,
  },
  {
    title: 'Infrastructure',
    description: 'Manage facilities, routes, and service coverage data.',
    icon: MapPinned,
  },
  {
    title: 'Gap analysis',
    description: 'Review transport equity gaps and prioritize action areas.',
    icon: ChartColumn,
  },
];

const AdminPanel = ({ user, onLogout }) => {
  return (
    <AdminLayout user={user} onLogout={onLogout} eyebrow="Operations overview" title="Dashboard">
      <section className="rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9))] p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-4 py-2 text-sm text-sky-200">
              <ShieldCheck className="h-4 w-4" />
              Admin workspace ready
            </div>
            <h3 className="mt-5 text-4xl font-bold">Welcome, {user?.name}</h3>
            <p className="mt-4 max-w-2xl text-slate-300">
              This panel is ready as your admin landing space after login. It can now be extended with live management screens.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
            Role: <span className="font-semibold text-white">{user?.role}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {adminCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/30">
            <div className="inline-flex rounded-2xl bg-sky-400/10 p-3 text-sky-200">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </article>
        ))}
      </section>
    </AdminLayout>
  );
};

export default AdminPanel;

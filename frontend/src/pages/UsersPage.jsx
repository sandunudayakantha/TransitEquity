import { useEffect, useState } from 'react';
import { BadgeCheck, Clock3, LoaderCircle, Shield, UserCheck, Users } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { fetchPendingUsers, fetchUsers, toggleUserApproval } from '../lib/users';

const roleLabels = {
  admin: 'Admin',
  user: 'Commuter',
  tOfficer: 'Transit Officer',
  iOfficer: 'Infrastructure Officer',
};

const roleBadgeClassNames = {
  admin: 'bg-sky-400/10 text-sky-200',
  user: 'bg-emerald-400/10 text-emerald-200',
  tOfficer: 'bg-amber-400/10 text-amber-200',
  iOfficer: 'bg-fuchsia-400/10 text-fuchsia-200',
};

const UsersPage = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeView, setActiveView] = useState('approvals');
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);

    try {
      const [allUsers, pending] = await Promise.all([
        fetchUsers(),
        fetchPendingUsers(),
      ]);

      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId) => {
    setError('');
    setSuccessMessage('');
    setApprovingId(userId);

    try {
      const updatedUser = await toggleUserApproval(userId);
      setSuccessMessage(updatedUser.isApproved ? 'Officer approved successfully.' : 'Officer moved back to pending.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update approval status.');
    } finally {
      setApprovingId(null);
    }
  };

  const pendingOfficerCount = pendingUsers.filter((account) => account.role !== 'user').length;
  const officerAccounts = users.filter((account) => ['tOfficer', 'iOfficer'].includes(account.role));

  return (
    <AdminLayout user={user} onLogout={onLogout} eyebrow="Access control" title="Users">
      <section className="rounded-4xl border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-200">
              {activeView === 'approvals' ? <Clock3 className="h-6 w-6" /> : <Users className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white">
                {activeView === 'approvals' ? 'Pending approvals' : 'User directory'}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white">
                {activeView === 'approvals' ? 'Officer approval queue' : 'All registered accounts'}
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className={`btn justify-center ${activeView === 'approvals' ? 'btn-primary' : 'btn-secondary border-white/15 bg-white/5 text-white hover:bg-white/10'}`}
              type="button"
              onClick={() => setActiveView('approvals')}
            >
              Pending Approvals
            </button>
            <button
              className={`btn justify-center ${activeView === 'directory' ? 'btn-primary' : 'btn-secondary border-white/15 bg-white/5 text-white hover:bg-white/10'}`}
              type="button"
              onClick={() => setActiveView('directory')}
            >
              User Directory
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        ) : null}

        {activeView === 'approvals' ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Pending officers</p>
                <p className="mt-3 text-3xl font-bold text-white">{pendingOfficerCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total pending</p>
                <p className="mt-3 text-3xl font-bold text-white">{pendingUsers.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Approved users</p>
                <p className="mt-3 text-3xl font-bold text-white">{users.filter((account) => account.isApproved).length}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-white">
                  <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                  Loading approval queue...
                </div>
              ) : null}

              {!isLoading && officerAccounts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-16 text-center text-white">
                  No officer accounts found right now.
                </div>
              ) : null}

              {!isLoading &&
                officerAccounts.map((account) => (
                  <article key={account._id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-xl font-semibold text-white">{account.name}</h4>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClassNames[account.role] || 'bg-white/10 text-white'}`}>
                            {roleLabels[account.role] || account.role}
                          </span>
                          {!account.isApproved ? (
                            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                              Pending
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4 grid gap-3 text-sm text-white sm:grid-cols-2">
                          <p>Email: <span className="font-medium text-white">{account.email}</span></p>
                          <p>Phone: <span className="font-medium text-white">{account.phoneNumber || 'Not provided'}</span></p>
                          <p>Address: <span className="font-medium text-white">{account.address || 'Not provided'}</span></p>
                          <p>Created: <span className="font-medium text-white">{new Date(account.createdAt).toLocaleDateString()}</span></p>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary gap-2"
                        type="button"
                        onClick={() => handleApprove(account._id)}
                        disabled={approvingId === account._id}
                      >
                        {approvingId === account._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                        {account.isApproved ? 'Set Pending' : 'Approve'}
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total users</p>
                <p className="mt-3 text-3xl font-bold text-white">{users.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Admins</p>
                <p className="mt-3 text-3xl font-bold text-white">{users.filter((account) => account.role === 'admin').length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Officers</p>
                <p className="mt-3 text-3xl font-bold text-white">{users.filter((account) => ['tOfficer', 'iOfficer'].includes(account.role)).length}</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
              {isLoading ? (
                <div className="flex items-center justify-center px-6 py-16 text-white">
                  <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                  Loading users...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Role</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Email</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Phone</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Status</th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((account) => (
                        <tr key={account._id} className="hover:bg-white/5">
                          <td className="px-5 py-4 text-sm text-white">
                            <div className="font-medium text-white">{account.name}</div>
                            <div className="mt-1 text-xs text-slate-300">
                              Joined {new Date(account.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClassNames[account.role] || 'bg-white/10 text-white'}`}>
                              {roleLabels[account.role] || account.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-white">{account.email}</td>
                          <td className="px-5 py-4 text-sm text-white">{account.phoneNumber || 'Not provided'}</td>
                          <td className="px-5 py-4 text-sm">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${account.isApproved ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-400/10 text-amber-200'}`}>
                              {account.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-white">
                            {account.role === 'admin' ? (
                              <span className="inline-flex items-center gap-2">
                                <Shield className="h-4 w-4 text-sky-300" />
                                Full access
                              </span>
                            ) : account.isApproved ? (
                              <span className="inline-flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                                Active account
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-amber-300" />
                                Waiting approval
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  );
};

export default UsersPage;

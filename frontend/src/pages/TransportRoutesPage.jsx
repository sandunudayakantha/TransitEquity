import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Edit3, LoaderCircle, Plus, TrainFront, Trash2, Route as RouteIcon, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { deleteTransport, fetchTransports } from '../lib/transports';
import ServiceStatusList from '../components/ServiceStatusList';

const TransportRoutesPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTransports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransports();
      setTransports(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to load transport routes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransports();
  }, []);

  const handleDelete = async (transportId) => {
    const transport = transports.find((item) => item._id === transportId);
    if (!window.confirm(`Delete route ${transport?.routeNumber || 'this route'}? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsDeletingId(transportId);

    try {
      await deleteTransport(transportId);
      setSuccessMessage('Transport route deleted successfully.');
      await loadTransports();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to delete transport route.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const toggleExpand = (routeId) => {
    setExpandedRouteId(current => current === routeId ? null : routeId);
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} eyebrow="Transport Management" title="Transit Routes">
      <section className="rounded-4xl border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
               <RouteIcon className="h-6 w-6 text-sky-400" />
               <p className="text-sm uppercase tracking-[0.2em] text-white">Manage operations</p>
            </div>
            <h3 className="mt-1 text-2xl font-bold text-white">Existing Routes</h3>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              Total routes: <span className="font-semibold text-white">{transports.length}</span>
            </div>
            <Link className="btn btn-primary gap-2 justify-center" to="/admin/transports/new">
              <Plus className="h-4 w-4" />
              Create Route
            </Link>
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

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-slate-300">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
              Loading routes...
            </div>
          ) : null}

          {!isLoading && transports.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-16 text-center text-white">
              No transport routes found. Create a new route to get started.
            </div>
          ) : null}

          {!isLoading &&
            transports.map((route) => (
              <article 
                key={route._id} 
                className={`rounded-3xl border transition-all duration-300 ${
                  expandedRouteId === route._id 
                    ? 'border-sky-400/30 bg-slate-900/80 ring-1 ring-sky-400/20' 
                    : 'border-white/10 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/20'
                } p-5 overflow-hidden`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(route._id)}>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`rounded-xl p-2 ${route.serviceType === 'Bus' ? 'bg-amber-400/10 text-amber-300' : 'bg-sky-400/10 text-sky-300'}`}>
                        {route.serviceType === 'Bus' ? <Bus className="h-5 w-5" /> : <TrainFront className="h-5 w-5" />}
                      </div>
                      <h4 className="text-xl font-semibold text-white">Route {route.routeNumber}</h4>
                      <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                        {route.serviceType}
                      </span>
                      <div className="ml-auto lg:hidden">
                        {expandedRouteId === route._id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-white sm:grid-cols-2 xl:grid-cols-4">
                      <p>Start Point: <span className="font-medium text-white">{route.startPoint}</span></p>
                      <p>End Point: <span className="font-medium text-white">{route.endPoint}</span></p>
                      <p>Frequency: <span className="font-medium text-white">{route.frequency} mins</span></p>
                      <p>Capacity: <span className="font-medium text-white">{route.capacity} seats</span></p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                       {route.coveredAreas?.map((area, idx) => (
                         <span key={area._id || idx} className="rounded-lg bg-sky-400/10 px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-sky-200">
                           {area.name}
                         </span>
                       ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] text-sky-300/70 font-bold uppercase tracking-widest">
                       <Truck className="h-3.5 w-3.5" />
                       {expandedRouteId === route._id ? 'Hide Vehicle Status' : 'View Vehicle Status'}
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <button className="btn btn-secondary h-10 gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10" type="button" onClick={(e) => { e.stopPropagation(); navigate(`/admin/transports/${route._id}/edit`); }}>
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="btn bg-red-500/15 text-red-100 hover:bg-red-500/25 h-10 gap-2" type="button" onClick={(e) => { e.stopPropagation(); handleDelete(route._id); }} disabled={isDeletingId === route._id}>
                      {isDeletingId === route._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </button>
                    <button className="hidden lg:flex btn bg-white/5 border border-white/10 text-slate-300 h-10 px-3 hover:bg-white/10" onClick={() => toggleExpand(route._id)}>
                       {expandedRouteId === route._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {expandedRouteId === route._id && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <ServiceStatusList route={route} />
                  </div>
                )}
              </article>
            ))}
        </div>
      </section>
    </AdminLayout>
  );
};

export default TransportRoutesPage;
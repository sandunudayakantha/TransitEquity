import { useEffect, useState } from 'react';
import { LoaderCircle, Plus, Trash2, Edit2, Clock, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import { fetchServicesByRoute, deleteServiceStatus, createServiceStatus, updateServiceStatus } from '../lib/services';
import ServiceStatusForm from './ServiceStatusForm';

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    Delayed: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    Completed: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    Cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
  };

  const Icon = {
    Active: CheckCircle2,
    Delayed: AlertTriangle,
    Completed: CheckCircle2,
    Cancelled: Ban,
  }[status] || CheckCircle2;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
};

const ServiceStatusList = ({ route }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const routePath = route.coveredAreas || [];

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchServicesByRoute(route._id);
      setServices(data);
    } catch (err) {
      setError('Failed to load vehicle statuses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [route._id]);

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Remove this vehicle status?')) return;
    try {
      await deleteServiceStatus(serviceId);
      await loadServices();
    } catch (err) {
      setError('Failed to delete status.');
    }
  };

  const handleCreateSubmit = async (payload) => {
    setIsSaving(true);
    try {
      await createServiceStatus(payload);
      setIsAdding(false);
      await loadServices();
    } catch (err) {
      setError('Failed to save status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubmit = async (payload) => {
    setIsSaving(true);
    try {
      await updateServiceStatus(editingServiceId, payload);
      setEditingServiceId(null);
      await loadServices();
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-10 text-slate-400">
      <LoaderCircle className="h-5 w-5 animate-spin mr-2" /> Loading vehicles...
    </div>
  );

  return (
    <div className="mt-6 border-t border-white/5 pt-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Current Vehicles & Status</h4>
        <button 
          className="btn btn-primary h-8 px-3 text-[10px] gap-1.5" 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || !!editingServiceId}
        >
          <Plus className="h-3.5 w-3.5" /> Add Vehicle Status
        </button>
      </div>

      {isAdding && (
        <ServiceStatusForm 
          routeId={route._id}
          routePath={routePath}
          isSaving={isSaving}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsAdding(false)}
          error={error}
        />
      )}

      {services.length === 0 && !isAdding ? (
        <div className="py-8 text-center text-xs text-slate-500 italic">
          No vehicles currently reported for this route.
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service._id}>
              {editingServiceId === service._id ? (
                <ServiceStatusForm 
                  initialData={service}
                  routeId={route._id}
                  routePath={routePath}
                  isSaving={isSaving}
                  onSubmit={handleUpdateSubmit}
                  onCancel={() => setEditingServiceId(null)}
                  error={error}
                />
              ) : (
                <div className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/0 p-3 transition hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-200">
                      <p className="text-sm font-bold">{service.vehicleNumber}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        Updated {new Date(service.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/5"></div>
                    <StatusBadge status={service.status} />
                    {service.delayMinutes > 0 && (
                      <span className="text-[10px] text-amber-200 font-medium bg-amber-400/5 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        +{service.delayMinutes} min delay
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-400/10" onClick={() => setEditingServiceId(service._id)}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => handleDelete(service._id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceStatusList;

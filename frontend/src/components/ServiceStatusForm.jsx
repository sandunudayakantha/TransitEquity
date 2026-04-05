import { useState, useEffect } from 'react';
import { LoaderCircle, Check, X, ShieldAlert, Map as MapIcon, Type } from 'lucide-react';
import VehicleLocationPicker from './VehicleLocationPicker';

const STATUS_ENUMS = ['Active', 'Delayed', 'Completed', 'Cancelled'];

const emptyForm = {
  vehicleNumber: '',
  status: 'Active',
  delayMinutes: 0,
  lat: '',
  lng: '',
};

const ServiceStatusForm = ({ initialData, routeId, routePath = [], isSaving, onSubmit, onCancel, error }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        vehicleNumber: initialData.vehicleNumber,
        status: initialData.status,
        delayMinutes: initialData.delayMinutes,
        lat: initialData.currentLocation?.lat || '',
        lng: initialData.currentLocation?.lng || '',
      };
    }
    return emptyForm;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLocationPick = ({ lat, lng }) => {
    setFormData((current) => ({
      ...current,
      lat: String(lat),
      lng: String(lng),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      routeId,
      vehicleNumber: formData.vehicleNumber,
      status: formData.status,
      delayMinutes: Number(formData.delayMinutes),
      currentLocation: {
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      }
    });
  };

  return (
    <form className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 text-sky-300 mb-2">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-xs uppercase font-bold tracking-wider">{initialData ? 'Update Vehicle Status' : 'Add New Vehicle Status'}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">Vehicle Number</span>
                <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/50" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="NB-1234" required />
                </label>

                <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">Status</span>
                <select className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/50" name="status" value={formData.status} onChange={handleChange}>
                    {STATUS_ENUMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">Delay (min)</span>
                <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none" type="number" name="delayMinutes" value={formData.delayMinutes} onChange={handleChange} />
                </label>

                <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">Lat</span>
                <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none" type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} required />
                </label>

                <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">Lng</span>
                <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none" type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} required />
                </label>
            </div>

            {error && <p className="text-red-400 text-xs px-2">{error}</p>}

            <div className="flex gap-3 pt-4 border-t border-white/5">
                <button className="btn btn-primary h-10 px-6 text-xs gap-2" type="submit" disabled={isSaving}>
                {isSaving ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                {initialData ? 'Update' : 'Save Status'}
                </button>
                <button className="btn bg-white/5 border border-white/15 text-white/70 h-10 px-6 text-xs gap-2 hover:bg-white/10" type="button" onClick={onCancel}>
                <X className="h-4 w-4" /> Cancel
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <VehicleLocationPicker 
                routePath={routePath} 
                currentLocation={{ lat: Number(formData.lat), lng: Number(formData.lng) }} 
                onLocationPick={handleLocationPick} 
            />
        </div>
      </div>
    </form>
  );
};

export default ServiceStatusForm;

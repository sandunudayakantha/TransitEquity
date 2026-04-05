import { useState } from 'react';
import { Bus, LoaderCircle, MapPinned, Plus, TrainFront } from 'lucide-react';
import TransportRouteMap from './TransportRouteMap';

const emptyForm = {
  routeNumber: '',
  serviceType: 'Bus',
  frequency: '',
  capacity: '',
  startPoint: '',
  endPoint: '',
  coveredAreas: [], // IDs in order
};

const TransportForm = ({ initialData, allAreas = [], isSaving, error, onSubmit, submitLabel }) => {
  const [formData, setFormData] = useState(() => initialData || emptyForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAreaToggle = (areaId) => {
    setFormData((current) => {
      const isSelected = current.coveredAreas.includes(areaId);
      const nextAreas = isSelected
        ? current.coveredAreas.filter((id) => id !== areaId)
        : [...current.coveredAreas, areaId];
      
      let nextStart = current.startPoint;
      let nextEnd = current.endPoint;

      if (nextAreas.length > 0) {
        const firstArea = allAreas.find(a => a._id === nextAreas[0]);
        const lastArea = allAreas.find(a => a._id === nextAreas[nextAreas.length - 1]);
        if (!nextStart && firstArea) nextStart = firstArea.name;
        if ((!nextEnd || nextEnd === nextStart) && lastArea) nextEnd = lastArea.name;
      }

      return { ...current, coveredAreas: nextAreas, startPoint: nextStart, endPoint: nextEnd };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...formData, frequency: Number(formData.frequency), capacity: Number(formData.capacity) });
  };

  return (
    <section className="mx-auto max-w-5xl rounded-4xl border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-200"><MapPinned className="h-6 w-6" /></div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">{initialData ? 'Edit route' : 'Create route'}</p>
          <h3 className="mt-1 text-2xl font-bold text-white">{initialData ? 'Update transit route' : 'Add a new transit route'}</h3>
        </div>
      </div>

      <form className="mt-8 grid gap-8 lg:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Route Number</span>
              <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="routeNumber" value={formData.routeNumber} onChange={handleChange} placeholder="138" required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Service Type</span>
              <select className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="serviceType" value={formData.serviceType} onChange={handleChange}>
                <option value="Bus">Bus</option>
                <option value="Train">Train</option>
              </select>
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Frequency (mins)</span>
              <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" min="1" name="frequency" value={formData.frequency} onChange={handleChange} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Capacity</span>
              <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} required />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium text-white">Start Point</span><input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="startPoint" value={formData.startPoint} onChange={handleChange} required /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-white">End Point</span><input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="endPoint" value={formData.endPoint} onChange={handleChange} required /></label>
          </div>
          <div className="block">
            <span className="mb-3 block text-sm font-medium text-white">Covered Areas (Select in order)</span>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {allAreas.map((area) => (
                <button key={area._id} type="button" onClick={() => handleAreaToggle(area._id)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${formData.coveredAreas.includes(area._id) ? 'bg-sky-400 text-slate-950' : 'bg-white/5 text-slate-300 ring-1 ring-white/10'}`}>
                  {area.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TransportRouteMap allAreas={allAreas} selectedAreaIds={formData.coveredAreas} onAreaToggle={handleAreaToggle} />
          {error && <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-primary flex-1 justify-center gap-2" type="submit" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitLabel}
            </button>
            <button className="btn btn-secondary border-white/15 bg-white/5 text-white hover:bg-white/10 px-8" type="button" onClick={() => setFormData(initialData || emptyForm)}>Reset</button>
          </div>
        </div>
      </form>
    </section>
  );
};

export const mapTransportToFormData = (transport) => ({
  routeNumber: transport.routeNumber,
  serviceType: transport.serviceType || 'Bus',
  frequency: String(transport.frequency),
  capacity: String(transport.capacity),
  startPoint: transport.startPoint,
  endPoint: transport.endPoint,
  coveredAreas: transport.coveredAreas?.map(a => a._id || a) || [],
});

export default TransportForm;

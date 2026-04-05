import { useEffect, useState } from 'react';
import { LoaderCircle, MapPin, Plus } from 'lucide-react';
import GoogleMapPicker from './GoogleMapPicker';
import { fetchAreas } from '../lib/areas';

const emptyForm = {
  name: '',
  type: 'Bus Stop',
  areaId: '',
  lat: '',
  lng: '',
  capacity: '',
  hasDisabledAccess: false,
};

const FacilityForm = ({
  initialData,
  isSaving,
  error,
  successMessage,
  onSubmit,
  submitLabel,
}) => {
  const [formData, setFormData] = useState(() => initialData || emptyForm);
  const [areas, setAreas] = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await fetchAreas();
        setAreas(data);
        // Pre-select first area if none selected and it's create mode
        if (data.length > 0 && !initialData?.areaId) {
          setFormData((current) => ({
            ...current,
            areaId: data[0]._id,
          }));
        }
      } catch (err) {
        console.error('Failed to load areas', err);
      } finally {
        setIsLoadingAreas(false);
      }
    };
    loadAreas();
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMapChange = (lat, lng) => {
    setFormData((current) => ({
      ...current,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
  };

  const handleReset = () => {
    setFormData(initialData || (areas.length > 0 ? { ...emptyForm, areaId: areas[0]._id } : emptyForm));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: formData.name.trim(),
      type: formData.type,
      areaId: formData.areaId,
      capacity: Number(formData.capacity),
      hasDisabledAccess: formData.hasDisabledAccess,
      coordinates: {
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      },
    });
  };

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-200">
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">
            {initialData ? 'Edit facility' : 'Create facility'}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {initialData ? 'Update transport facility' : 'Add a new transport facility'}
          </h3>
        </div>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Facility Name</span>
            <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="name" value={formData.name} onChange={handleChange} placeholder="Main Terminal" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Facility Type</span>
            <select className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="type" value={formData.type} onChange={handleChange} required>
              <option value="Bus Stop">Bus Stop</option>
              <option value="Station">Station</option>
              <option value="Parking">Parking</option>
              <option value="Bike Hub">Bike Hub</option>
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Area / Zone</span>
            {isLoadingAreas ? (
              <div className="flex h-[46px] items-center rounded-xl border border-white/15 bg-slate-900 px-4 text-slate-400">Loading areas...</div>
            ) : (
              <select className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="areaId" value={formData.areaId} onChange={handleChange} required>
                {areas.length === 0 && <option value="" disabled>No areas available. Create one first.</option>}
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>{area.name} ({area.city})</option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Capacity</span>
            <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" min="0" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="100" required />
          </label>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative flex items-center">
            <input type="checkbox" name="hasDisabledAccess" checked={formData.hasDisabledAccess} onChange={handleChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/20 bg-slate-900 checked:border-sky-400 checked:bg-sky-400 transition-all" />
            <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900 opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
              <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-white">Has Disabled Access</span>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Latitude</span>
            <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" step="any" min="-90" max="90" name="lat" value={formData.lat} onChange={handleChange} placeholder="6.9335" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Longitude</span>
            <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" step="any" min="-180" max="180" name="lng" value={formData.lng} onChange={handleChange} placeholder="79.85" required />
          </label>
        </div>

        <GoogleMapPicker
          lat={formData.lat === '' ? null : Number(formData.lat)}
          lng={formData.lng === '' ? null : Number(formData.lng)}
          onChange={handleMapChange}
        />

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="btn btn-primary justify-center gap-2" type="submit" disabled={isSaving || isLoadingAreas}>
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {submitLabel}
          </button>
          <button className="btn btn-secondary justify-center border-white/15 bg-white/5 text-white hover:bg-white/10" type="button" onClick={handleReset}>
            Reset form
          </button>
        </div>
      </form>
    </section>
  );
};

export const mapFacilityToFormData = (facility) => ({
  name: facility.name,
  type: facility.type,
  areaId: facility.areaId?._id || facility.areaId || '',
  capacity: String(facility.capacity),
  hasDisabledAccess: Boolean(facility.hasDisabledAccess),
  lat: String(facility.coordinates?.lat ?? ''),
  lng: String(facility.coordinates?.lng ?? ''),
});

export default FacilityForm;

import { useState } from 'react';
import { LoaderCircle, MapPinned, Plus } from 'lucide-react';
import GoogleMapPicker from './GoogleMapPicker';

const emptyForm = {
  name: '',
  city: '',
  population: '',
  areaSize: '',
  lat: '',
  lng: '',
};

const AreaForm = ({
  initialData,
  isSaving,
  error,
  successMessage,
  onSubmit,
  submitLabel,
}) => {
  const [formData, setFormData] = useState(() => initialData || emptyForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
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
    setFormData(initialData || emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: formData.name.trim(),
      city: formData.city.trim(),
      population: Number(formData.population),
      areaSize: Number(formData.areaSize),
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
          <MapPinned className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">
            {initialData ? 'Edit area' : 'Create area'}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {initialData ? 'Update transit area' : 'Add a new transit area'}
          </h3>
        </div>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">Area name</span>
          <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="name" value={formData.name} onChange={handleChange} placeholder="Pettah" required />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">City</span>
          <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" name="city" value={formData.city} onChange={handleChange} placeholder="Colombo" required />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Population</span>
            <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" min="0" name="population" value={formData.population} onChange={handleChange} placeholder="50000" required />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Area size</span>
            <input className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20" type="number" min="0.01" step="0.01" name="areaSize" value={formData.areaSize} onChange={handleChange} placeholder="2.0" required />
          </label>
        </div>

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
          <button className="btn btn-primary justify-center gap-2" type="submit" disabled={isSaving}>
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

export const mapAreaToFormData = (area) => ({
  name: area.name,
  city: area.city,
  population: String(area.population),
  areaSize: String(area.areaSize),
  lat: String(area.coordinates?.lat ?? ''),
  lng: String(area.coordinates?.lng ?? ''),
});

export default AreaForm;

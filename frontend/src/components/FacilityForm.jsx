import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MapPin, Plus } from 'lucide-react';
import FacilityRouteMap from './FacilityRouteMap';
import { fetchAreas } from '../lib/areas';
import { fetchTransports } from '../lib/transports';

const emptyForm = {
  name: '',
  type: 'Bus Stop',
  areaId: '',
  transportId: '',
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
  const [transports, setTransports] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedTransportId, setSelectedTransportId] = useState('');

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setFormData(initialData);
    setSelectedTransportId(initialData.transportId || '');
  }, [initialData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [areasResponse, transportsResponse] = await Promise.all([
          fetchAreas(1, 1000),
          fetchTransports(1, 1000),
        ]);

        const areasData = areasResponse.data || (Array.isArray(areasResponse) ? areasResponse : []);
        const transportsData = transportsResponse.data || (Array.isArray(transportsResponse) ? transportsResponse : []);

        setAreas(areasData);
        setTransports(transportsData);

        if (areasData.length > 0 && !initialData?.areaId) {
          setFormData((current) => ({
            ...current,
            areaId: areasData[0]._id,
          }));
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [initialData]);

  const selectedTransport = useMemo(
    () => transports.find((transport) => transport._id === selectedTransportId) || null,
    [selectedTransportId, transports],
  );

  useEffect(() => {
    if (!selectedTransport?.serviceType) {
      return;
    }

    const suggestedFacilityType =
      selectedTransport.serviceType === 'Train' ? 'Station' : 'Bus Stop';

    setFormData((current) => {
      if (current.type === suggestedFacilityType) {
        return current;
      }

      return {
        ...current,
        type: suggestedFacilityType,
      };
    });
  }, [selectedTransport]);

  const routePath = useMemo(() => {
    if (!selectedTransport || areas.length === 0) {
      return [];
    }

    return selectedTransport.coveredAreas
      ?.map((areaRef) => {
        if (
          typeof areaRef === 'object' &&
          areaRef?.coordinates &&
          Number.isFinite(Number(areaRef.coordinates.lat)) &&
          Number.isFinite(Number(areaRef.coordinates.lng))
        ) {
          return {
            lat: Number(areaRef.coordinates.lat),
            lng: Number(areaRef.coordinates.lng),
            name: areaRef.name,
          };
        }

        const id = typeof areaRef === 'object' ? areaRef._id || areaRef : areaRef;
        const area = areas.find((entry) => String(entry._id) === String(id));

        if (!area?.coordinates) {
          return null;
        }

        return {
          lat: Number(area.coordinates.lat),
          lng: Number(area.coordinates.lng),
          name: area.name,
        };
      })
      .filter(Boolean) || [];
  }, [selectedTransport, areas]);

  const uniqueRoutePointCount = useMemo(() => {
    const uniquePoints = new Set(
      routePath.map((point) => `${Number(point.lat).toFixed(6)},${Number(point.lng).toFixed(6)}`),
    );
    return uniquePoints.size;
  }, [routePath]);

  const selectedAreaCenter = useMemo(() => {
    if (!formData.areaId || areas.length === 0) {
      return null;
    }

    const area = areas.find((entry) => String(entry._id) === String(formData.areaId));
    return area?.coordinates || null;
  }, [formData.areaId, areas]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMapChange = useCallback((lat, lng) => {
    setFormData((current) => ({
      ...current,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
  }, []);

  const handleReset = () => {
    const nextFormData =
      initialData || (areas.length > 0 ? { ...emptyForm, areaId: areas[0]._id } : emptyForm);
    setSelectedTransportId(nextFormData.transportId || '');
    setFormData(nextFormData);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      name: formData.name.trim(),
      type: formData.type,
      areaId: formData.areaId,
      transportId: formData.transportId || undefined,
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
            <input
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Main Terminal"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Facility Type</span>
            <select
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
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
            {isLoadingData ? (
              <div className="flex h-[46px] items-center rounded-xl border border-white/15 bg-slate-900 px-4 text-slate-400">
                Loading areas...
              </div>
            ) : (
              <select
                autoComplete="off"
                className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                required
              >
                {areas.length === 0 && (
                  <option value="" disabled>
                    No areas available. Create one first.
                  </option>
                )}
                {areas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.name} ({area.city})
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Capacity</span>
            <input
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
              type="number"
              min="0"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="100"
              required
            />
          </label>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              name="hasDisabledAccess"
              checked={formData.hasDisabledAccess}
              onChange={handleChange}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/20 bg-slate-900 transition-all checked:border-sky-400 checked:bg-sky-400"
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-slate-900 opacity-0 transition-opacity peer-checked:opacity-100"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M3 8L6 11L11 3.5"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="currentColor"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">Has Disabled Access</span>
        </label>

        <div className="mt-6 mb-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-5">
          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-sky-200">
              Visual Guide: Overlay Transport Route (Optional)
            </span>
            <select
              className="w-full rounded-xl border border-sky-400/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
              value={selectedTransportId}
              onChange={(event) => {
                const nextTransportId = event.target.value;
                setSelectedTransportId(nextTransportId);
                setFormData((current) => ({
                  ...current,
                  transportId: nextTransportId,
                }));
              }}
            >
              <option value="">-- Do not overlay any route --</option>
              {transports.map((transport) => (
                <option key={transport._id} value={transport._id}>
                  Route {transport.routeNumber} ({transport.startPoint} to {transport.endPoint})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-sky-300/70">
              Select a route to draw its covered-area path on the map so you can place the facility
              beside the relevant transport corridor.
            </p>
            {selectedTransport ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
                  {selectedTransport.serviceType} route
                </span>
                <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
                  Suggested: {selectedTransport.serviceType === 'Train' ? 'Station' : 'Bus Stop'}
                </span>
                {routePath.length > 0 ? (
                  <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-100">
                    {routePath.length} mapped point{routePath.length === 1 ? '' : 's'}
                  </span>
                ) : null}
              </div>
            ) : null}
            {selectedTransport && routePath.length < 2 ? (
              <p className="mt-2 text-xs text-amber-200">
                This route currently has only {routePath.length || '0'} mapped covered area
                {routePath.length === 1 ? '' : 's'}, so a route line cannot be drawn yet.
              </p>
            ) : null}
            {selectedTransport && routePath.length >= 2 && uniqueRoutePointCount < 2 ? (
              <p className="mt-2 text-xs text-amber-200">
                This route has multiple covered areas, but they currently share the same map
                coordinates. Update the area coordinates to different locations to make the line
                appear.
              </p>
            ) : null}
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-sky-200">Map Placement Guide</span>
              <span className="text-xs text-sky-300/70">
                {routePath.length > 0 ? 'Place marker near the route' : 'Place marker within the area'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-sky-100/90">
              Select the area first, then optionally choose a transport route. The map will center on
              the selected area when no route is chosen, or fit the route path when a route is
              selected. After that, click the map to drop the facility marker in the correct spot.
            </p>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Latitude</span>
            <input
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
              type="number"
              step="any"
              min="-90"
              max="90"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              placeholder="6.9335"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Longitude</span>
            <input
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20"
              type="number"
              step="any"
              min="-180"
              max="180"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              placeholder="79.85"
              required
            />
          </label>
        </div>

        <FacilityRouteMap
          lat={formData.lat === '' ? null : Number(formData.lat)}
          lng={formData.lng === '' ? null : Number(formData.lng)}
          onChange={handleMapChange}
          areaCenter={selectedAreaCenter}
          facilityType={formData.type}
          routePath={routePath}
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
          <button
            className="btn btn-primary justify-center gap-2"
            type="submit"
            disabled={isSaving || isLoadingData}
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {submitLabel}
          </button>
          <button
            className="btn btn-secondary justify-center border-white/15 bg-white/5 text-white hover:bg-white/10"
            type="button"
            onClick={handleReset}
          >
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
  transportId: facility.transportId?._id || facility.transportId || '',
  capacity: String(facility.capacity),
  hasDisabledAccess: Boolean(facility.hasDisabledAccess),
  lat: String(facility.coordinates?.lat ?? ''),
  lng: String(facility.coordinates?.lng ?? ''),
});

export default FacilityForm;

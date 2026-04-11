import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit3, LoaderCircle, Plus, Trash2, Accessibility, ZapOff } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { deleteFacility, fetchFacilities } from '../lib/facilities';
import { fetchAreas } from '../lib/areas';

const ManageFacilitiesPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [areasMap, setAreasMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async (page = 1) => {
    setIsLoading(true);

    try {
      const [facilitiesData, areasData] = await Promise.all([
        fetchFacilities(page, 10),
        fetchAreas()
      ]);
      
      const aMap = {};
      const areasList = Array.isArray(areasData.data) ? areasData.data : (Array.isArray(areasData) ? areasData : []);
      areasList.forEach(a => {
        aMap[a._id] = a;
      });
      setAreasMap(aMap);
      setFacilities(facilitiesData.data || []);
      setTotalFacilities(facilitiesData.total || 0);
      setTotalPages(facilitiesData.pages || 1);
      setCurrentPage(facilitiesData.page || 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to load facilities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const handleDelete = async (facilityId) => {
    const facility = facilities.find((item) => item._id === facilityId);
    const confirmed = window.confirm(
      `Delete ${facility?.name || 'this facility'}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsDeletingId(facilityId);

    try {
      await deleteFacility(facilityId);
      setSuccessMessage('Facility deleted successfully.');
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to delete facility.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} eyebrow="Infrastructure management" title="Facilities">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white">Manage infrastructure</p>
            <h3 className="mt-1 text-2xl font-bold text-white">Existing facilities</h3>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              Total facilities: <span className="font-semibold text-white">{totalFacilities}</span>
            </div>
            <Link className="btn btn-primary gap-2 justify-center" to="/admin/facilities/new">
              <Plus className="h-4 w-4" />
              Add Facility
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-white">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-white">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-white">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
              Loading facilities...
            </div>
          ) : null}

          {!isLoading && facilities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-16 text-center text-white">
              No facilities found yet. Add your first facility.
            </div>
          ) : null}

          {!isLoading &&
            facilities.map((facility) => {
              // Ensure we fallback if areaId is populated vs raw string
              const areaIdStr = typeof facility.areaId === 'object' && facility.areaId !== null ? facility.areaId._id : facility.areaId;
              const area = areasMap[areaIdStr] || (typeof facility.areaId === 'object' ? facility.areaId : null);

              return (
                <article key={facility._id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-xl font-semibold text-white">{facility.name}</h4>
                        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-medium text-white">
                          {facility.type}
                        </span>
                        {facility.hasDisabledAccess ? (
                           <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-white border border-emerald-500/20">
                             <Accessibility size={12} /> Universal Access
                           </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-white border border-slate-500/20">
                             <ZapOff size={12} /> Standard Access
                           </span>
                        )}
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-white sm:grid-cols-2 xl:grid-cols-4">
                        <p>Area: <span className="font-medium text-white">{area ? area.name : 'Unknown Area'}</span></p>
                        <p>Capacity: <span className="font-medium text-white">{facility.capacity}</span></p>
                        <p>Coords: <span className="font-medium text-white">{facility.coordinates?.lat.toFixed(6)}, {facility.coordinates?.lng.toFixed(6)}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="btn btn-secondary gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10" type="button" onClick={() => navigate(`/admin/facilities/${facility._id}/edit`)}>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button className="btn bg-red-500/15 text-white hover:bg-red-500/25 gap-2" type="button" onClick={() => handleDelete(facility._id)} disabled={isDeletingId === facility._id}>
                        {isDeletingId === facility._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

          {/* Pagination Controls */}
          {!isLoading && facilities.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 sm:flex-row rounded-3xl mt-4">
              <p className="text-sm text-white/60">
                Showing <span className="font-semibold text-white">{Math.min((currentPage - 1) * 10 + 1, totalFacilities)}</span> to{' '}
                <span className="font-semibold text-white">{Math.min(currentPage * 10, totalFacilities)}</span> of{' '}
                <span className="font-semibold text-white">{totalFacilities}</span> facilities
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="btn btn-secondary h-9 px-3 text-xs disabled:opacity-30 border-white/10"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? 'bg-sky-500 text-white' 
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="btn btn-secondary h-9 px-3 text-xs disabled:opacity-30 border-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default ManageFacilitiesPage;

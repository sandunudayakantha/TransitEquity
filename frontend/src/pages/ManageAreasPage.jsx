import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit3, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { deleteArea, fetchAreas } from '../lib/areas';

const ManageAreasPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAreas, setTotalAreas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAreas = async (page = 1) => {
    setIsLoading(true);

    try {
      const response = await fetchAreas(page, 10);
      // Handles both paginated and non-paginated responses for backward compatibility
      if (response && response.data) {
        setAreas(response.data || []);
        setTotalAreas(response.total || 0);
        setTotalPages(response.pages || 1);
        setCurrentPage(response.page || 1);
      } else {
        setAreas(Array.isArray(response) ? response : []);
        setTotalAreas(Array.isArray(response) ? response.length : 0);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to load areas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAreas(currentPage);
  }, [currentPage]);

  const handleDelete = async (areaId) => {
    const area = areas.find((item) => item._id === areaId);
    const confirmed = window.confirm(
      `Delete ${area?.name || 'this area'}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsDeletingId(areaId);

    try {
      await deleteArea(areaId);
      setSuccessMessage('Area deleted successfully.');
      await loadAreas();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to delete area.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} eyebrow="Coverage management" title="Manage Areas">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white">Manage areas</p>
            <h3 className="mt-1 text-2xl font-bold text-white">Existing areas</h3>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              Total areas: <span className="font-semibold text-white">{totalAreas}</span>
            </div>
            <Link className="btn btn-primary gap-2 justify-center" to="/admin/areas/new">
              <Plus className="h-4 w-4" />
              Create Area
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
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-white">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
              Loading areas...
            </div>
          ) : null}

          {!isLoading && areas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-16 text-center text-white">
              No areas found yet. Create your first area to start building coverage data.
            </div>
          ) : null}

          {!isLoading &&
            areas.map((area) => (
              <article key={area._id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-xl font-semibold text-white">{area.name}</h4>
                      <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-medium text-white">
                        {area.city}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-white sm:grid-cols-2 xl:grid-cols-4">
                      <p>Population: <span className="font-medium text-white">{area.population.toLocaleString()}</span></p>
                      <p>Area size: <span className="font-medium text-white">{area.areaSize}</span></p>
                      <p>Density: <span className="font-medium text-white">{Number(area.density || 0).toLocaleString()}</span></p>
                      <p>Coords: <span className="font-medium text-white">{area.coordinates?.lat}, {area.coordinates?.lng}</span></p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn btn-secondary gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10" type="button" onClick={() => navigate(`/admin/areas/${area._id}/edit`)}>
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="btn bg-red-500/15 text-red-100 hover:bg-red-500/25 gap-2" type="button" onClick={() => handleDelete(area._id)} disabled={isDeletingId === area._id}>
                      {isDeletingId === area._id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

          {/* Pagination Controls */}
          {!isLoading && areas.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 sm:flex-row rounded-3xl mt-4">
              <p className="text-sm text-white/60">
                Showing <span className="font-semibold text-white">{Math.min((currentPage - 1) * 10 + 1, totalAreas)}</span> to{' '}
                <span className="font-semibold text-white">{Math.min(currentPage * 10, totalAreas)}</span> of{' '}
                <span className="font-semibold text-white">{totalAreas}</span> areas
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

export default ManageAreasPage;

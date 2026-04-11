import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AreaForm, { mapAreaToFormData } from '../components/AreaForm';
import { createArea, fetchAreaById, updateArea } from '../lib/areas';

const AreaFormPage = ({ user, onLogout, mode }) => {
  const navigate = useNavigate();
  const { areaId } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (mode !== 'edit' || !areaId) {
      return;
    }

    const loadArea = async () => {
      setIsLoading(true);

      try {
        const area = await fetchAreaById(areaId);
        setInitialData(mapAreaToFormData(area));
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to load area.');
      } finally {
        setIsLoading(false);
      }
    };

    loadArea();
  }, [areaId, mode]);

  const handleSubmit = async (payload) => {
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      if (mode === 'edit') {
        await updateArea(areaId, payload);
        setSuccessMessage('Area updated successfully. Redirecting to records...');
      } else {
        await createArea(payload);
        setSuccessMessage('Area created successfully. Redirecting to records...');
      }

      setTimeout(() => {
        navigate('/admin/areas');
      }, 700);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to save area.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      user={user}
      onLogout={onLogout}
      eyebrow="Coverage management"
      title={mode === 'edit' ? 'Edit Area' : 'Create Area'}
    >
      <button
        className="btn btn-secondary mb-6 gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
        type="button"
        onClick={() => navigate('/admin/areas')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Area Records
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-white">
          <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
          Loading area details...
        </div>
      ) : (
        <AreaForm
          initialData={initialData}
          isSaving={isSaving}
          error={error}
          successMessage={successMessage}
          onSubmit={handleSubmit}
          submitLabel={mode === 'edit' ? 'Update area' : 'Create area'}
        />
      )}
    </AdminLayout>
  );
};

export default AreaFormPage;

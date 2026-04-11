import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import FacilityForm, { mapFacilityToFormData } from '../components/FacilityForm';
import { createFacility, fetchFacilityById, updateFacility } from '../lib/facilities';

const FacilityFormPage = ({ user, onLogout, mode }) => {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (mode !== 'edit' || !facilityId) {
      return;
    }

    const loadFacility = async () => {
      setIsLoading(true);

      try {
        const facility = await fetchFacilityById(facilityId);
        setInitialData(mapFacilityToFormData(facility));
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to load facility.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFacility();
  }, [facilityId, mode]);

  const handleSubmit = async (payload) => {
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      if (mode === 'edit') {
        await updateFacility(facilityId, payload);
        setSuccessMessage('Facility updated successfully. Redirecting to records...');
      } else {
        await createFacility(payload);
        setSuccessMessage('Facility created successfully. Redirecting to records...');
      }

      setTimeout(() => {
        navigate('/admin/facilities');
      }, 700);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Failed to save facility.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      user={user}
      onLogout={onLogout}
      eyebrow="Infrastructure management"
      title={mode === 'edit' ? 'Edit Facility' : 'Create Facility'}
    >
      <button
        className="btn btn-secondary mb-6 gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
        type="button"
        onClick={() => navigate('/admin/facilities')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Facility Records
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 text-white">
          <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
          Loading facility details...
        </div>
      ) : (
        <FacilityForm
          initialData={initialData}
          isSaving={isSaving}
          error={error}
          successMessage={successMessage}
          onSubmit={handleSubmit}
          submitLabel={mode === 'edit' ? 'Update facility' : 'Create facility'}
        />
      )}
    </AdminLayout>
  );
};

export default FacilityFormPage;

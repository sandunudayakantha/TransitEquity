import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import TransportForm, { mapTransportToFormData } from '../components/TransportForm';
import { fetchAreas } from '../lib/areas';
import { createTransport, fetchTransportById, updateTransport } from '../lib/transports';

const TransportFormPage = ({ user, onLogout, mode }) => {
  const { transportId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [allAreas, setAllAreas] = useState([]);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const responseData = await fetchAreas(1, 1000);
        const areas = responseData.data || (Array.isArray(responseData) ? responseData : []);
        setAllAreas(areas);
        if (mode === 'edit' && transportId) {
          const transport = await fetchTransportById(transportId);
          setInitialData(mapTransportToFormData(transport));
        }
      } catch (err) { setError(err.response?.data?.error || 'Failed to load data.'); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, [mode, transportId]);

  const handleSubmit = async (payload) => {
    setIsSaving(true);
    try {
      if (mode === 'edit') await updateTransport(transportId, payload);
      else await createTransport(payload);
      navigate('/admin/transports');
    } catch (err) { setError(err.response?.data?.error || 'Failed to save transport route.'); }
    finally { setIsSaving(false); }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} eyebrow="Transport Management" title={mode === 'edit' ? 'Edit Route' : 'Create Route'}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-sky-400" />
          <p className="mt-4 font-medium">Loading form data...</p>
        </div>
      ) : (
        <TransportForm initialData={initialData} allAreas={allAreas} isSaving={isSaving} error={error} onSubmit={handleSubmit} submitLabel={mode === 'edit' ? 'Update route' : 'Create transit route'} />
      )}
    </AdminLayout>
  );
};

export default TransportFormPage;

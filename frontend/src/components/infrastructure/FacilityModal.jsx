import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FACILITY_TYPES } from '../../utils/facilityConfig';

const FacilityModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    name: '', type: 'Bus Stop', areaId: '', 
    coordinates: { lat: 6.9, lng: 79.8 }, capacity: 0, hasDisabledAccess: false
  });

  useEffect(() => {
    if (editData) setFormData(editData);
    else setFormData({ name: '', type: 'Bus Stop', areaId: '', coordinates: { lat: 6.9, lng: 79.8 }, capacity: 0, hasDisabledAccess: false });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-primary">{editData ? 'Edit Facility' : 'Add New Facility'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <input placeholder="Facility Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent outline-none" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          
          <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <input placeholder="Area ID (e.g. 65af...)" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" 
            value={formData.areaId?._id || formData.areaId} onChange={e => setFormData({...formData, areaId: e.target.value})} required />

          <div className="grid grid-cols-2 gap-4">
             <input type="number" placeholder="Capacity" className="px-4 py-3 rounded-xl border border-gray-200 outline-none" 
               value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
             <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 rounded-xl border border-gray-100">
                <input type="checkbox" checked={formData.hasDisabledAccess} onChange={e => setFormData({...formData, hasDisabledAccess: e.target.checked})} className="w-4 h-4 accent-accent" />
                <span className="text-sm font-medium">Disabled Access</span>
             </label>
          </div>

          <button type="submit" className="w-full btn btn-primary py-4 rounded-xl font-bold shadow-lg shadow-blue-100 mt-2">
            {editData ? 'Update Facility' : 'Create Facility'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacilityModal;
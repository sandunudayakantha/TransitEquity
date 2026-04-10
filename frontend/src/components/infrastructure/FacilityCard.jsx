import React from 'react';
import { MapPin, Accessibility, Edit2, Trash2, Users } from 'lucide-react';
import { getFacilityStyle } from '../../utils/facilityConfig';

const FacilityCard = ({ facility, onEdit, onDelete }) => {
  const { color, bg, icon: Icon } = getFacilityStyle(facility.type);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={24} />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(facility)} className="p-2 hover:bg-gray-100 rounded-lg text-primary"><Edit2 size={16}/></button>
          <button onClick={() => onDelete(facility._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16}/></button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-primary mb-1">{facility.name}</h3>
      <p className="text-secondary text-sm flex items-center gap-1 mb-4">
        <MapPin size={14} /> {facility.areaId?.name || 'Unknown Area'}
      </p>

      <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Capacity</span>
          <div className="flex items-center gap-1 text-primary font-semibold">
            <Users size={14} /> {facility.capacity}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Access</span>
          <div className={`flex items-center gap-1 font-semibold ${facility.hasDisabledAccess ? 'text-green-600' : 'text-gray-400'}`}>
            <Accessibility size={14} /> {facility.hasDisabledAccess ? 'Universal' : 'Standard'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;
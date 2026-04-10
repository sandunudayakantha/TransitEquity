import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, MapPin, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { createFeedback } from '../lib/feedback';
import toast from 'react-hot-toast';

const ISSUE_TYPES = [
  'New Route', 
  'New Bus Stop', 
  'Increase Frequency', 
  'Accessibility'
];

const URGENCY_LEVELS = [
  { label: 'Low', value: 'Low', color: 'bg-green-100 text-green-700' },
  { label: 'Medium', value: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'High', value: 'High', color: 'bg-red-100 text-red-700' }
];

const FeedbackForm = ({ onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    areaId: queryParams.get('areaId') || '',
    issueType: 'New Bus Stop',
    description: '',
    urgency: 'Medium',
    coordinates: {
      lat: parseFloat(queryParams.get('lat')) || null,
      lng: parseFloat(queryParams.get('lng')) || null
    },
    address: queryParams.get('areaName') || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.description.length < 10) {
      toast.error("Please provide a more detailed description (min 10 chars).");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Submitting feedback...");

    try {
      await createFeedback(formData);
      toast.success("Feedback submitted! Our planners will review it shortly.", { id: toastId });
      
      if (onSuccess) onSuccess();
      else navigate('/feedback');
      
      // Reset form if staying on page
      setFormData({
        areaId: '',
        issueType: 'New Bus Stop',
        description: '',
        urgency: 'Medium',
        coordinates: { lat: null, lng: null },
        address: ''
      });
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Send className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Issue Type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase">Issue Type</label>
          <select
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium p-3"
            required
          >
            {ISSUE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase">Urgency Level</label>
          <div className="flex gap-2">
            {URGENCY_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData(p => ({ ...p, urgency: level.value }))}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                  formData.urgency === level.value 
                    ? `${level.color} border-current shadow-inner` 
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location / Area */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 uppercase">Location / Area</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Pettah Market, Colombo 11"
            className="w-full pl-10 rounded-xl border-gray-200 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-sm p-3"
            required
          />
        </div>
        {formData.coordinates.lat && (
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Geodata attached from Map
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 uppercase">Describe the issue</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Please explain the problem clearly. Mention specific roads, peak times, or accessibility barriers..."
          className="w-full rounded-xl border-gray-200 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-sm p-3 resize-none"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;

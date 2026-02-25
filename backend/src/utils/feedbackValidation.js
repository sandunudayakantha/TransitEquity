export const validateFeedback = (data) => {
  const { areaId, issueType, description, coordinates, address, urgency } = data;

  if (!areaId) return { isValid: false, message: 'areaId is required' };
  
  if (!/^[0-9a-fA-F]{24}$/.test(areaId)) {
    return { isValid: false, message: 'Invalid areaId format' };
  }

  const validIssueTypes = ['New Route', 'New Bus Stop', 'Increase Frequency', 'Accessibility'];
  if (!issueType || !validIssueTypes.includes(issueType)) {
    return { isValid: false, message: 'Invalid issueType' };
  }

  if (!description || description.length < 10) {
    return { isValid: false, message: 'Description must be at least 10 characters' };
  }

  // ✅ FIX: Accept EITHER coordinates OR address
  if (!coordinates && !address) {
    return { isValid: false, message: 'Either coordinates or address is required' };
  }

  // If coordinates provided, validate them
  if (coordinates) {
    if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return { isValid: false, message: 'Coordinates must have numeric lat and lng' };
    }
  }

  // If address provided, ensure it's a string
  if (address && typeof address !== 'string') {
    return { isValid: false, message: 'Address must be a string' };
  }

  const validUrgency = ['Low', 'Medium', 'High'];
  if (!urgency || !validUrgency.includes(urgency)) {
    return { isValid: false, message: 'Urgency must be Low, Medium, or High' };
  }

  return { isValid: true };
};
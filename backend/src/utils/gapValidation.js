export const validateGapAnalysis = (data) => {
  const { areaId } = data;
  
  if (!areaId) {
    return { isValid: false, message: 'areaId is required' };
  }
  
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(areaId)) {
    return { isValid: false, message: 'Invalid areaId format' };
  }
  
  return { isValid: true };
};
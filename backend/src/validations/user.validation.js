export const validateUser = (userData) => {
    // Implement validation logic
    if (!userData.email) {
        return { valid: false, message: 'Email is required' };
    }
    return { valid: true };
};

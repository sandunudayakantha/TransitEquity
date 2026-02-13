const validateUser = (data) => {
    const { name, email, password, phoneNumber } = data;
    const errors = [];

    // Check required fields
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }

    if (!email || email.trim() === '') {
        errors.push('Email is required');
    } else {
        // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    if (!password || password.trim() === '') {
        errors.push('Password is required');
    } else {
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
        errors.push('Phone number is required');
    }
    // Add more phone validation if needed (e.g. length, numeric)

    return {
        isValid: errors.length === 0,
        message: errors.length > 0 ? errors.join(', ') : null
    };
};

export default validateUser;

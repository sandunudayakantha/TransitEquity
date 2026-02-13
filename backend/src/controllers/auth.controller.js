import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';

import validateUser from '../utils/validation.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, role, address, phoneNumber } = req.body;

        // Manual Validation
        const validation = validateUser({ name, email, password, phoneNumber });
        if (!validation.isValid) {
            res.status(400);
            throw new Error(validation.message);
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Default to 'user' if not provided
        const userRole = role || 'user';

        // 'user' role is auto-approved. Others are pending.
        const isApproved = userRole === 'user';

        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            isApproved,
            address,
            phoneNumber
        });

        if (user) {
            if (isApproved) {
                const token = generateToken(res, user._id, user.role);
                res.status(201).json({
                    token,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isApproved: user.isApproved,
                        address: user.address,
                        phoneNumber: user.phoneNumber
                    }
                });
            } else {
                res.status(201).json({
                    message: 'Account created successfully. Please wait for admin approval.',
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isApproved: user.isApproved,
                        address: user.address,
                        phoneNumber: user.phoneNumber
                    }
                });
            }
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        // If headers already sent, delegate to default error handler (though in async middleware it usually catches throw)
        // But since we are manually catching:
        if (res.headersSent) {
            throw error;
        }
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error; // Let the global error handler handle the response format
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isApproved) {
                res.status(401);
                throw new Error('Account not approved yet');
            }

            const token = generateToken(res, user._id, user.role);
            res.json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved,
                    address: user.address,
                    phoneNumber: user.phoneNumber
                }
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        if (res.headersSent) {
            throw error;
        }
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    };
    res.status(200).json(user);
};

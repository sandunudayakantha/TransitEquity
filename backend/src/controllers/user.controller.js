import User from '../models/User.model.js';

// @desc    Get all users (with pagination)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Global statistics for the admin dashboard
    const adminCount = await User.countDocuments({ role: 'admin' });
    const officerCount = await User.countDocuments({ role: { $in: ['tOfficer', 'iOfficer'] } });

    res.json({
        users,
        page,
        pages: Math.ceil(totalUsers / limit),
        totalUsers,
        stats: {
            adminCount,
            officerCount
        }
    });
};

// @desc    Toggle approval for an officer account
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
export const approveUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (!['tOfficer', 'iOfficer'].includes(user.role)) {
            res.status(400);
            throw new Error('Only officer accounts can have approval toggled');
        }

        user.isApproved = !user.isApproved;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isApproved: updatedUser.isApproved,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get pending users
// @route   GET /api/users/pending
// @access  Private/Admin
export const getPendingUsers = async (req, res) => {
    const users = await User.find({ isApproved: false });
    res.json(users);
};

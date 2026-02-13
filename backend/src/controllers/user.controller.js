import User from '../models/User.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

// @desc    Approve a user
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
export const approveUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isApproved = true;
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

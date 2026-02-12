export const protect = (req, res, next) => {
    // Implement token verification logic here
    console.log('Auth Middleware');
    next();
};

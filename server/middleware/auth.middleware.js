/**
 * Middleware to authenticate requests using session cookie
 */
export const authenticate = async (req, res, next) => {
    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        req.userId = parseInt(userId);
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


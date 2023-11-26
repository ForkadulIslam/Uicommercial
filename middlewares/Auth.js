const jwt = require('jsonwebtoken');
const Auth = (req, res, next) =>{
    const {authorization} = req.headers;
    try {
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.name = decode.userName;
        req.id = decode.id;

        next();
    } catch (error) {
        console.error('Authentication failed:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        return res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = Auth;


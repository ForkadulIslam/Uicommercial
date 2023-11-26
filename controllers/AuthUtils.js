const jwt = require('jsonwebtoken');
module.exports = {
    extractToken: function(req) {
        const authHeader = req.headers['authorization'];
        return authHeader && authHeader.split(' ')[1];
    },
    extractUserId: function(req) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
    
        if (!token) {
          return null;
        }
    
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;
    
          return userId;
        } catch (error) {
          console.log(error);
          return null;
        }
    }
};

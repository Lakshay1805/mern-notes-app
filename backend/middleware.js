const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    // extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {

        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
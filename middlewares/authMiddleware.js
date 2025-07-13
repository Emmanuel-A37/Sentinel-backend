import jwt from 'jsonwebtoken'

const validateToken = (req, res, next) => {
    const token = req.cookies?.jwt;
    if(!token) return res.status(400).json({message : "No token found"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(400).json({message : error.message});
    }
}

export default validateToken;
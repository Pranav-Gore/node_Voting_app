const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) =>{
    //extract the jwt token from the request headers
    const token = req.headers['authorization']?.split(' ')[1];
    
    if(!token){
        return res.status(401).json({error: "Token not provided"});
    }

    try{
        //verify the jwt token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        //Attach user information to the req object
        req.user = decodedToken;
        next();
    }
    catch(error){
        return res.status(403).json({error: "Invalid token"});
    }
}

//function to generate jwt token
    const generateToken = (user) => {
        return jwt.sign(user, process.env.JWT_SECRET);
    }

module.exports = {jwtAuthMiddleware, generateToken};
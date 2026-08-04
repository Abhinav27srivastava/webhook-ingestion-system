const jwt = require("jsonwebtoken");

const authenticate = (req,res,next)=>{
    //get authorization Header from request
    const authHeader = req.headers.authorization;
    // checking if authorization header is present and starts with Bearer then return 401 unauthorized if not present   if(!authHeader || !authHeader.startsWith("Bearer ")){ 
   if(!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token missing"
    });
}
 //extract token from authorization header
 const token = authHeader.split(" ")[1]; 
 try{
    // verify the token using jwt.verify method
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach the decoded user information to the request object
    req.user = decoded;
    next();
 }
catch(error ){
    return res.status(401).json({
        success: false,
        message: "Unauthorized access. Invalid token"
    });
}
 };

 module.exports = authenticate;


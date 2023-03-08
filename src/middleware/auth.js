const jwt = require('jsonwebtoken');
const User = require('../models/user')

const auth = async(req, res, next) => {
    let token = req.headers.authorization
    
    if(!token){
        return res.status(403).send('Please Authenticate!');
    }
    
    token = token.split(' ')[1];

    try{
        const decoded = jwt.verify(token, "thisismysecretkey")
        const user = await User.findOne({_id : decoded._id, token});
        
        req.user = user;
        next();
    }
    catch(e){
        res.status(401).send('Invalid Token!');
    }
}

module.exports = auth
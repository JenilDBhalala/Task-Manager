const jwt = require('jsonwebtoken');
const User = require('../models/user')

const auth = async(req, res, next) => {
    try{
        let token = req.header('authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, "thisismysecretkey")
        const user = await User.findOne({_id : decoded._id, 'tokens.token' : token});
        
        if(!user) {
            throw new Error()
        }

        req.user = user;
        req.token = token;
        next();
    }
    catch(e){
        res.status(401).send({error : "Please Authenticate!"});
    }
}

module.exports = auth
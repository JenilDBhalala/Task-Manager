const express = require('express');
const router = express.Router();

//importing user models
const User = require('../models/user')

//create user
router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try{
        await user.save();
        res.status(201).send(user)
    }
    catch(e){
        res.status(400).send(e)
    }
})


//user login
router.post('/users/login',async(req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        res.send(user)
    }
    catch(e){
        res.status(400).send();
    }
})


//fetch all users
router.get('/users', async(req, res) => {
    try{
        const users = await User.find();
        res.send(users);
    }
    catch(e){
        res.status(500).send(e)
    }
})


//fetch user by id
router.get('/users/:id', async(req, res) => {
    const _id = req.params.id

    try{
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user)
    }
    catch(e){
        res.status(500).send(e)
    }
})


//update user
router.put('/users/:id', async(req, res) => {
    const allowedUpdates = ['name','password','email','age'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({error : "Invalid Update"})
    }

    const _id = req.params.id;
    try{
        const user = await User.findById(_id);
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        // //this will bypasses pre hook, because we defined it on save
        // const user = await User.findByIdAndUpdate(_id, req.body, {new : true, runValidators : true});
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }
    catch(e){
        res.status(400).send(e)
    }
})

//delete user
router.delete('/users/:id', async(req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send();
        }
        res.status(200).send(user);
    }
    catch(e){
        res.status(500).send()
    }
})


module.exports = router;
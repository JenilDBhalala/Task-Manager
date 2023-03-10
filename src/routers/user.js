const express = require('express');
const router = express.Router();
const multer = require('multer')
const sharp = require('sharp')

//importing user models
const User = require('../models/user')
const auth = require('../middleware/auth')


//creating instance of multer
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error("Please upload an image!"));
        }
        cb(undefined, true);
    }
})


//upload profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

//get profile picture of any user by id
router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }
        res.set('content-type', 'image')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})


//delete profile picture
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send()
})

//create user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    }
    catch (e) {
        res.status(400).send(e)
    }
})


//user login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })
    }
    catch (e) {
        res.status(400).send();
    }
})


//user logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokens) => tokens.token !== req.token)
        await req.user.save();
        res.status(200).send();
    }
    catch (e) {
        res.status(400).send();
    }
})


//fetch my profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})


//update user profile
router.put('/users/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'password', 'email', 'age'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send({ error: "Invalid Update" })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        // //this will bypasses pre hook, because we defined it on save
        // const user = await User.findByIdAndUpdate(_id, req.body, {new : true, runValidators : true});

        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})


//delete user profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        req.user.remove();
        res.status(200).send(req.user);
    }
    catch (e) {
        res.status(500).send()
    }
})


module.exports = router;
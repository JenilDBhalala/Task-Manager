const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')

//importing task models
const Task = require('../models/task')

//adding tasks
router.post('/tasks',auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })

    try{
        await task.save();
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


//fetching all tasks 
router.get('/tasks', auth, async(req, res) => {
    try{
        // const tasks = await Task.find({owner : req.user._id});
        await req.user.populate('tasks').execPopulate();
        console.log(req.user)
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send(e)
    }
})


//find task by id
router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({_id, owner : req.user._id});   
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
})


//update task by id
router.put('/tasks/:id', auth, async(req, res) => {
    const allowedUpdates = ['description','completed'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({error : "Invalid Update"})
    }

    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id, owner : req.user._id});
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


//delete task
router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id})
        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    }
    catch(e){
        res.status(500).send()
    }
})


module.exports = router;
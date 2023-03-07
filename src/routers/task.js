const express = require('express');
const router = express.Router();

//importing task models
const Task = require('../models/task')

//create task
router.post('/tasks', async(req, res) => {
    const task = new Task(req.body)

    try{
        await task.save();
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

//fetch all tasks 
router.get('/tasks', async(req, res) => {
    try{
        const tasks = await Task.find();
        res.send(tasks)
    }
    catch(e){
        res.status(500).send(e)
    }
})

//find task by id
router.get('/tasks/:id', async(req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }
})


//update task
router.put('/tasks/:id', async(req, res) => {
    const allowedUpdates = ['description','completed'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({error : "Invalid Update"})
    }

    const _id = req.params.id;
    try{
        const task = await Task.findById(_id);
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new : true, runValidators : true});
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


//delete task
router.delete('/tasks/:id', async(req, res) => {
    try{
        const task = await Task.findByIdAndDelete(req.params.id)
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
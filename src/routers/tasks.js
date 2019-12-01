const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.post('/tasks', auth, async (req, res)=>{

    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }

})

//GET /tasks/completed=true
//GET /tasks/limit=10&skip=10
//GET /tasks/sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res)=>{
    

    try{
        // const tasks = await Task.find({ owner: req.user._id });
        // res.send(tasks);

        match = {}
        sort = {}


        if(req.query.completed){
            match.completed = req.query.completed === 'true';
        }

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = (parts[1] === 'desc') ? -1 : 1;
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send(e);
    }

})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id;

    try{
        const task = await Task.findOne({ _id, owner: req.user._id });

        if(!task){
            res.status(401).send('Task not found!!');
        }

        res.send(task);

    }catch(e){
        res.status(500).send(e);
    }

})

router.patch('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id;

    const requestedUpdates = Object.keys(req.body);
    const allowedUpdates = ['completed','description'];
    
    const validOperation = requestedUpdates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if(!validOperation){
        return res.status(400).send({ error: "Invalid operation!!"});
    }

    try{
        const task = await Task.findOne({ _id, owner : req.user._id });

        if(!task){
            return res.status(404).send('Task Not Found!!');
        }

        requestedUpdates.forEach((update) => {
            task[update] = req.body[update];
        })

        await task.save();

        res.status(200).send(task);

    }catch(e){
        res.status(400).send(e);
    }
    
    // Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true}).then((task) => {

    //     if(!task){
    //         return res.status(404).send('Task Not Found!!');
    //     }

    //     return res.status(200).send(task);

    // }).catch((e) => {
    //     res.status(400).send(e);
    // })
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id });

        if(!task){
            return res.status(404).send('Task Not Found!!');
        }

        res.status(200).send(task);

    }catch(e){
        res.status(404).send(e);
    }

})

module.exports = router;
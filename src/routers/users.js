const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendExitEmail } = require('../emails/account');
const multer = require('multer');
const sharp = require('sharp');

router.post('/users', async (req, res)=>{
    
    const user = new User(req.body);

    try{
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }

})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    }catch(e){
        res.status(400).send();
    }
})

router.post('/users/logout', auth, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })

        await req.user.save();

        res.send();

    }catch(e){
        res.status(500).send(e);
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
})

router.get('/users/me',auth, async (req, res) => {

    try{
        res.send(req.user); 
    }catch(e){
        res.status(500).send(e);
    }
})

// router.patch('/users/:id',async (req, res) => {
//     const _id = req.params.id;

//     const requestedUpdates = Object.keys(req.body);
//     const allowedUpdates = ['name', 'email', 'age', 'password'];

//     const validOperation = requestedUpdates.every((update) => {
//         return allowedUpdates.includes(update);
//     })

//     if(!validOperation){
//         return res.status(400).send({ error: "Invalid Operation!!"});
//     }
    
//     try{

//         const user = await User.findById(_id);

//         if(!user){
//             return res.status(404).send('User Not Found!!');
//         }
        
//         requestedUpdates.forEach((update) => {
//             user[update] = req.body[update];
//         })

//         await user.save();

//         res.status(200).send(user);

//     }catch(e){
//         res.status(400).send(e);
//     }

// })

router.patch('/users/me', auth, async(req, res) => {

    try{
        const requestedUpdates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'age', 'password'];

        const validOperation = requestedUpdates.every((update) => {
            return allowedUpdates.includes(update);
        })

        if(!validOperation){
            return res.status(400).send({'error': 'Invalid Operation!!'});
        }

        requestedUpdates.forEach((update) => {
            req.user[update] = req.body[update];
        })

        const modifiedUser = await req.user.save();

        res.status(200).send(modifiedUser);
    }catch(e){
        res.status(400).send(e);
    }

    
})

router.delete('/users/me', auth, async (req, res) => {
 
    try{
        await req.user.remove();
        sendExitEmail(req.user.email, req.user.name)
        res.status(200).send(req.user);
    }catch(e){
        res.status(400).send(e);
    }

})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){  
        if(!file.originalname.match(/\.(png|jpg|jpeg)/)){
            return cb(new Error('Please upload a valid imgage!'))
        }
        cb(undefined, true)
    }
}) 

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize(500, 500).png().toBuffer();
      
    req.user.avatar = buffer;
    
    await req.user.save();
    res.send('Profile pic sent successfully!!');
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req, res) =>  {
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(404).send();
    }
    
})


module.exports = router;
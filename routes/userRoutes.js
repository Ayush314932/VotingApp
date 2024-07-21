const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the person data

        // Create a new Person document using the Mongoose model
        const newUser = new User(data);

        // Save the new person to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id 
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract username and password from request body
        const {aadharCardNumber, password} = req.body;

        // Find the user by aadharcardnumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate Token 
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', async (req, res) => {
    try{
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.put('/profile/password',jwtAuthMiddleware, async (req, res)=>{
    try{
        const userId = req.user; // Extract the id from the token
        const {currentPasssword,newpassword}=req.body //Extract the current and new password from request body

        //find the userby userId
        const user = await User.findById(userId);

        // If password does not match, return error
        if( !user || !(await user.comparePassword(currentPasssword))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        //update the user's password
        user.password = newpassword;
        await user.save();



        console.log('password updated');
        res.status(200).json({message: "password updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:id',jwtAuthMiddleware, async (req, res) => {
    try{
        const personId = req.params.id; // Extract the person's ID from the URL parameter
        
        // Assuming you have a Person model
        const response = await Person.findByIdAndRemove(personId);
        if (!response) {
            return res.status(404).json({ error: 'Person not found' });
        }
        console.log('data delete');
        res.status(200).json({message: 'person Deleted Successfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


module.exports = router;
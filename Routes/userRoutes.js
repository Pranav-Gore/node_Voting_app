const express = require('express');
const router = express.Router();

const {jwtAuthMiddleware, generateToken} = require ('./../jwt.js')

// Define a POST route to create a new User entry
router.post("/signup", async (req, res) => {
    try {
        // Get the data from the request body
        const data = req.body;

         // Check if there is already an admin user
         const adminUser = await User.findOne({ role: 'admin' });
         if (data.role === 'admin' && adminUser) {
             return res.status(400).json({ error: 'Admin user already exists' });
         }

        //   // Validate Aadhar Card Number must have exactly 12 digit
        // if (!/^\d{12}$/.test(data.aadharCardNumber)) {
        //     return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        // }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        // Create a new instance of the User model with the data
        const newUser = new User(data);

        // Save the new User to the database
        const response = await newUser.save();
        console.log("Data saved");

        const payload ={
            id: response.id,
        }

        const token = generateToken(payload);
        console.log("Token is: ",token);

        // Send a success response with the saved User data
        res.status(200).json({response: response, token: token});
    } catch (error) {
        // Log the error and send a server error response
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//login route

router.post("/login", async (req, res) => {
    try {
        // extract username and password from req body
        const {aadharCardNumber, password} = req.body;

        // Find the User in the database using the provided aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // Check if the User exists and if the provided password matches the stored password
        if (!user || !user.comparePassword(password)) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const payload ={
            id: user.id,
        }

        const token = generateToken(payload);

        // return token as response
        res.json({token});      
    } 
    catch (error) {
        // Log the error and send a server error response
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//profile route
router.get("/profile",jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);
        
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Define a PUT route to fetch User entries based on id and Update
router.put("/profile/password",jwtAuthMiddleware, async(req,res)=>{
    try{
        const userId = req.user;//extract the id from token
        const {currentPassword, newPassword} = req.body;//Extract current and new password from req.body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        //find the user by userId
        const user = await User.findById(userId);

        //if password doesnt match return error
        if(!user.comparePassword(currentPassword)){
            return res.status(401).json({error: "Invalid current password"});
        }
        //update the user password
        user.password = newPassword;
        await user.save();

        console.log("password successfully updated");
        res.status(200).json({message: "Password updated successfully"});
    
    }
    catch(eror){
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;
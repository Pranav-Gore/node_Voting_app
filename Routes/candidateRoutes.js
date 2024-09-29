const express = require('express');
const router = express.Router();

const User = require('../Models/user.js')

const Candidate = require('./../Models/condidate.js')

const {jwtAuthMiddleware} = require ('./../jwt.js')

const checkAdminRole = async(userId)=>{
    try {
        // check if the user has admin role in the database
        const user = await User.findById(userId);
        return user.role === "admin";
    } catch (err) {
        return false;
    }
}

// Define a POST route to create a new Candidate entry
router.post("/",jwtAuthMiddleware, async (req, res) => {
    try {

        if(! checkAdminRole(req.user.id))
            return res.status(403).json({ error: "Unauthorized access" });

        // Get the data from the request body
        const data = req.body;

        // Create a new instance of the Candidate model with the data
        const newCandidate = new Candidate(data);

        // Save the new Candidate to the database
        const response = await newCandidate.save();
        console.log("Data saved");

        // Send a success response with the saved Candidate data
        res.status(200).json({response: response});
    } catch (error) {
        // Log the error and send a server error response
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Define a PUT route to fetch Candidate entries based on id and Update
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        // Await the checkAdminRole function
        if(! checkAdminRole(req.user.id)) 
            return res.status(403).json({ error: "Unauthorized access" });

        const candidateId = req.params.candidateId; // extract the id from the URL parameter
        const updateCandidateData = req.body; // update data from the Candidate

        const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
            new: true, // return the updated document
            runValidators: true // run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        console.log("Data successfully updated");
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        // Await the checkAdminRole function
        if (! checkAdminRole(req.user.id))
            return res.status(403).json({ error: "Unauthorized access" });

        const candidateId = req.params.candidateId; // extract the id from URL parameter

        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        console.log("Candidate deleted successfully");
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//let's start voting
router.post("/vote/:candidateId",jwtAuthMiddleware, async(req,res)=>{

        const candidateId = req.params.candidateId;
        const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        if(user.isVoted){
            return res.status(403).json({ error: "User has already voted" });
        }

        if(user.role == 'admin'){
            return res.status(403).json({ error: "Admins cannot vote" });
        }

        //update the candidate document to record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();
        
        //update the user document to mark the vote
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: "Vote Counted Successfully"});

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

//get vote count
router.get("/vote/count", async(req,res)=>{
    try {
        const candidates = await Candidate.find().sort({voteCount: 'desc'});
        const voteCounts = candidates.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        res.status(200).json({voteCounts: voteCounts});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
})

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
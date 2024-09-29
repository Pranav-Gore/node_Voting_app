const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party :{
        type: String,
        required: true
    },
    age : {
        type: Number,
        required: true
    },
    votes : [{
        user:{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' ,// referencing Vote model
            required : true
        },
        votedAt :{
            type: Date,
            default: Date.now()
        }
    }],
    voteCount: {
        type: Number,
        default: 0
    },
    
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
})

module.exports = mongoose.model('Candidate', candidateSchema);
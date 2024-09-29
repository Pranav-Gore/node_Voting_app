// Import the required modules
const express = require("express");
const app = express();

// Import the database connection and the person model
const db = require("./db.js");
require('dotenv').config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// Import the router file
const userRoutes = require('./Routes/userRoutes.js')
const CandidateRoutes = require('./Routes/candidateRoutes.js')

//use th router
app.use("/user",userRoutes);
app.use("/candidate",CandidateRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
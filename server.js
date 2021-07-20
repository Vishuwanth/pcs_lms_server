import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import autoIncrement from "mongoose-auto-increment"
// autoIncrement = require("mongoose-auto-increment")
import bodyParser from "body-parser"
import jwt from "jsonwebtoken"

const app = express()

app.use(express.json())
// app.use(express.urlencoded())
app.use(cors())
app.use(bodyParser.json())

const JWT_SECRET = "PCS SECRET KEY"

mongoose.connect('mongodb://localhost:27017/pcsLms',{
    useNewUrlParser: true,
    useUnifiedTopology:true
},()=>{
    console.log("DB Connected")
})

const employeeSchema =new mongoose.Schema({
    FirstName: { type: String, required: true },
  MiddleName: { type: String, required: true },
  LastName: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Gender: { type: String, required: true },
  DOB: { type: Date, required: true },
  ContactNo: { type: String, required: true },
  leaveApplication: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LeaveApplication" }
  ],
})
autoIncrement.initialize(mongoose.connection);
employeeSchema.plugin(autoIncrement.plugin, {
    model: "Employee",
    field: "EmployeeID"
  });
  

const User = new mongoose.model("Employee",employeeSchema)

//Routes

app.listen(9002,() => {
    console.log("BE started at port 9002")
})
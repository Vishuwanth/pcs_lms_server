import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import autoIncrement from "mongoose-auto-increment"
// autoIncrement = require("mongoose-auto-increment")
import bodyParser from "body-parser"
import jwt from "jsonwebtoken"
import Joi from "Joi"

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(express.urlencoded())
app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(bodyParser.json())

const jwtKey = "PCS SECRET KEY"
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/pcsLms',{
    useNewUrlParser: true,
    useUnifiedTopology:true
},()=>{
    console.log("DB Connected")
})


//Employee Schema
const employeeSchema =new mongoose.Schema({
  FirstName: { type: String, required: false },
  MiddleName: { type: String, required: false },
  LastName: { type: String, required: false },
  Email: { type: String, required: false, unique: false },
  Password: { type: String, required: false },
  Gender: { type: String, required: false },
  DOB: { type: Date, required: false },
  ContactNo: { type: String, required: false },
  Account: { type: Number, required: false },
  leaveApplication: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LeaveApplication" }
  ]
})
autoIncrement.initialize(mongoose.connection);
employeeSchema.plugin(autoIncrement.plugin, {
    model: "Employee",
    field: "EmployeeID"
  });
  
const employees = new mongoose.model("Employee",employeeSchema)


//Leave Application Schema

const leaveApplicationSchema = new mongoose.Schema({
    Leavetype: { type: String, required: false },
    FromDate: { type: Date, required: false },
    ToDate: { type: Date, required: false },
    Reasonforleave: { type: String, required: false },
    Status: { type: String, required: false },
    employee: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }]
  });
leaveApplicationSchema.plugin(autoIncrement.plugin, {
    model: "LeaveApplication",
    field: "LeaveApplicationID"
  });
  
const LeaveApplication = mongoose.model(
    "LeaveApplication",
    leaveApplicationSchema
  );

const EmployeeValidation = Joi.object().keys({
  
  FirstName: Joi.string()
    .max(200)
    .required(),
  MiddleName: Joi.string()
    .max(200)
    .required(),
  LastName: Joi.string()
    .max(200)
    .required(),
  Email: Joi.string()
    .max(200)
    .required(),
  Password: Joi.string()
    .max(100)
    .required(),
  Gender: Joi.string()
    .max(100)
    .required(),
  DOB: Joi.date().required(),
  
  ContactNo: Joi.string()
    .max(20)
    .required(),
  
  Account: Joi.number()
    .max(3)
    .required()
});


//Routes
//adding employees (removed verifyHR ,JOI,  EmployeeValidation functions)
app.post("/employee", (req, res) => {
    console.log("here the data")
      console.log(req.body.FirstName)
      let newEmployee;
      newEmployee = {
        FirstName: req.body.FirstName,
        MiddleName: req.body.MiddleName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Password: req.body.Password,
        Gender: req.body.Gender,
        DOB: req.body.DOB,
        ContactNo: req.body.ContactNo,
        Account: req.body.Account
      };

      employees.create(newEmployee, function (err, employee) {
        if (err) {
          console.log(err);
          res.send("error");
        } else {
          res.send(employee);

          console.log("new employee Saved");
        }
      });
      console.log(req.body);
    
  
});

//Login Route
app.post("/login", (req, res) => {
      console.log("here it is")
        console.log(req.body.userMail)
        console.log(req.body.userPass)
        
        employees.findOne(
          { Email: req.body.userMail },
          "Password _id Account FirstName LastName",
          function (err, employees) {
            if (err || employees == null) {
              console.log("first if part")
              res.send("false");
            } else {
              if (employees.Password == req.body.userPass) {
                console.log("passed the function")
              const  emp = {
                  _id: employees._id,
                  Account: employees.Account,
                  FirstName: employees.FirstName,
                  LastName: employees.LastName
                };
                var token = jwt.sign(emp, jwtKey);
                
                res.send(token);
              } else {
                console.log("else part")
                res.sendStatus(400);
              }
            }
          }
        );
});

//Getting Employee Information to load table in Leave Application
app.get("/leave-application-emp/:id", (req, res) => {
  console.log(req.params.id);
  employees.findById(req.params.id)
    .populate({
      path: "leaveApplication"
    })
    .select("FirstName LastName MiddleName")
    .exec(function (err, employee) {
      if (err) {
        console.log(err);
        res.send("error");
      } else {
        console.log("successfully ret")
        res.send(employee);
      }
    });
});

//Adding leave applciation (removed verifyEmployee, Joi)
app.post("/leave-application-emp/:id", (req, res) => {
  employees.findById(req.params.id, function (err, employee) {
        if (err) {
          console.log(err);
          res.send("err");
        } else {
          let newLeaveApplication;
          newLeaveApplication = {
            Leavetype: req.body.Leavetype,
            FromDate: req.body.FromDate,
            ToDate: req.body.ToDate,
            Reasonforleave: req.body.Reasonforleave,
            Status: req.body.Status,
            employee: req.params.id
          };
          console.log(newLeaveApplication)
          LeaveApplication.create(newLeaveApplication, function (err,leaveApplication) {
            if (err) {
              console.log(err);
              res.send("error");
            } else {
              employee.leaveApplication.push(leaveApplication);
              employee.save(function (err, data) {
                if (err) {
                  console.log(err);
                  res.send("err");
                } else {
                  console.log(data);
                  res.send(leaveApplication);
                }
              });
              console.log("new leaveApplication Saved");
            }
          });
          console.log(req.body);
        }
      });
    
  
});





app.listen(9002,() => {
    console.log("BE started at port 9002")
})
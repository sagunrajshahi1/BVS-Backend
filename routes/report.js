const express=require("express");

const router=express.Router();

const {

dailyReport,

monthlyReport,

studentHistory

}=require("../services/reports/attendanceReport");

router.get("/daily/:date",async(req,res)=>{

res.json(

await dailyReport(

req.params.date

)

);

});

router.get("/monthly/:month",async(req,res)=>{

res.json(

await monthlyReport(

req.params.month

)

);

});

router.get("/student/:code",async(req,res)=>{

res.json(

await studentHistory(

req.params.code

)

);

});

module.exports=router;
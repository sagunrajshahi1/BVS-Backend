const express=require("express");

const router=express.Router();

const {

manualAttendance

}=require("../services/manualAttendance");

router.post("/",async(req,res)=>{

res.json(

await manualAttendance(

req.body.code

)

);

});

module.exports=router;
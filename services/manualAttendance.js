const {

findStudent,

alreadyMarkedToday,

addAttendance,

getTodayColumn,

loadClassStudents,

fillAbsent,

markPresent,

updateDashboard

}=require("./sheets");

const {getMergedClass}=require("./classMap");

async function manualAttendance(code){

const student=await findStudent(code);

if(!student){

return{

success:false,

message:"Student not found"

};

}

const exists=await alreadyMarkedToday(code);

if(exists){

return{

success:false,

message:"Already Marked"

};

}

const sheet=getMergedClass(student.class);

await loadClassStudents(sheet);

const todayColumn=await getTodayColumn(sheet);

await fillAbsent(sheet,todayColumn);

await markPresent(sheet,student.code,todayColumn);

await addAttendance(student,"Manual");

await updateDashboard();

return{

success:true,

student

};

}

module.exports={

manualAttendance

};
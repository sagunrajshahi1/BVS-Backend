const sheets=require("../config/google");

const spreadsheetId=process.env.SPREADSHEET_ID;

async function getStudents(){

    const response=await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"RawData!A:D"

    });

    return response.data.values||[];

}

async function addStudent(student){

    await sheets.spreadsheets.values.append({

        spreadsheetId,

        range:"RawData!A:D",

        valueInputOption:"USER_ENTERED",

        requestBody:{

            values:[[

                student.sno,

                student.code,

                student.name,

                student.class

            ]]

        }

    });

    return{

        success:true,

        message:"Student Added"

    };

}

async function updateStudent(code,data){

    const response=await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"RawData!A:D"

    });

    const rows=response.data.values||[];

    for(let i=1;i<rows.length;i++){

        if(rows[i][1]==code){

            await sheets.spreadsheets.values.update({

                spreadsheetId,

                range:`RawData!A${i+1}:D${i+1}`,

                valueInputOption:"USER_ENTERED",

                requestBody:{

                    values:[[

                        data.sno,

                        code,

                        data.name,

                        data.class

                    ]]

                }

            });

            return{

                success:true,

                message:"Student Updated"

            };

        }

    }

    return{

        success:false,

        message:"Student Not Found"

    };

}

async function deleteStudent(code){

    return{

        success:true,

        message:"Delete feature will be enabled after sheet row mapping."

    };

}

module.exports={

    getStudents,

    addStudent,

    updateStudent,

    deleteStudent

};
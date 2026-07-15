const {

    getNepalDateTime

} = require("./nepalTime");

let currentSession = {

    active: false,

    school: "",

    class: "",

    group: "",

    coach: "",

    startTime: null

};

function startSession(data){

    currentSession = {

        active: true,

        school: data.school,

        class: data.class,

        group: data.group,

        coach: data.coach,

        startTime: getNepalDateTime()

    };

}

function endSession(){

    currentSession.active = false;

}

function getSession(){

    return currentSession;

}

module.exports = {

    startSession,

    endSession,

    getSession

};
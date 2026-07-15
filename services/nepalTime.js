function getNepalDate() {

    return new Date().toLocaleDateString(
        "en-CA",
        {
            timeZone: "Asia/Kathmandu"
        }
    );

}

function getNepalTime() {

    return new Date().toLocaleTimeString(
        "en-US",
        {
            timeZone: "Asia/Kathmandu"
        }
    );

}

function getNepalDateTime() {

    return new Date().toLocaleString(
        "en-US",
        {
            timeZone: "Asia/Kathmandu"
        }
    );

}

module.exports = {

    getNepalDate,
    getNepalTime,
    getNepalDateTime

};
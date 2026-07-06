function getMergedClass(className) {

    className = String(className).trim().toUpperCase();

    const map = {

        "4A":"4ABC",
        "4B":"4ABC",
        "4C":"4ABC",

        "5A":"5ABC",
        "5B":"5ABC",
        "5C":"5ABC",

        "6A":"6ABC",
        "6B":"6ABC",
        "6C":"6ABC",

        "7A":"7ABC",
        "7B":"7ABC",
        "7C":"7ABC",

        "8A":"8AB",
        "8B":"8AB",

        "8C":"8CD",
        "8D":"8CD",

        "9A":"9AB",
        "9B":"9AB",

        "9C":"9CD",
        "9D":"9CD",

        "10A":"10AB",
        "10B":"10AB",

        "10C":"10CDE",
        "10D":"10CDE",
        "10E":"10CDE"

    };

    return map[className] || null;

}

module.exports = {
    getMergedClass
};
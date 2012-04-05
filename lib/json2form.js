"use strict"; // run code in ES5 strict mode

/**
 * Converts an object to an application/x-www-form-urlencoded string.
 * NOTE: This function does not accept nested objects. The json must
 * only contain booleans, numbers and strings.
 *
 * @param {Object<String, Boolean|Number|String>} json
 * @throws {TypeError}
 * @return {String}
 */
function json2form(json) {
    var key,
        value,
        result = "";

    if (json === null || typeof(json) !== "object" || Array.isArray(json) === true) {
        throw new TypeError("json must be an object");
    }

    for (key in json) {
        if (json.hasOwnProperty(key)) {
            value = json[key];
            result += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
        }
    }

    result = result.substr(1);  // remove first &

    return result;
}

module.exports = json2form;
"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    json2form = require("../lib/json2form.js");

function expectTypeError(err) {
    expect(err.constructor).to.be(TypeError);
}

describe("json2form", function () {
    it("should convert a simple json with strings, numbers and booleans", function () {
        var simpleJSON = {
                "string": "Hello",
                "number": 0.2,
                "boolean": true
            },
            encoded = json2form(simpleJSON);

        expect(encoded).to.be("string=Hello&number=0.2&boolean=true");
    });
    it("should convert risky chars properly", function () {
        var riskyJSON = {
                "Ä Ö u": "Ä Ö u",
                "&=": "&="
            },
            encoded = json2form(riskyJSON);

        expect(encoded).to.be("%C3%84%20%C3%96%20u=%C3%84%20%C3%96%20u&%26%3D=%26%3D");
    });
    it("should also accept an empty object", function () {
        var emptyJSON = {},
            encoded = json2form(emptyJSON);

        expect(encoded).to.be("");
    });
    it("should throw an type error", function () {
        expect(function () {
            json2form();
        }).to.throwException(expectTypeError);
        expect(function () {
            json2form(null);
        }).to.throwException(expectTypeError);
        expect(function () {
            json2form(true);
        }).to.throwException(expectTypeError);
        expect(function () {
            json2form(2);
        }).to.throwException(expectTypeError);
        expect(function () {
            json2form("hello");
        }).to.throwException(expectTypeError);
        expect(function () {
            json2form([]);
        }).to.throwException(expectTypeError);
    });
});
"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    PremailerRequester = require("../lib/PremailerRequester.class.js");

describe("PremailerRequester", function () {
    var instance;

    describe("#getDebug", function () {
        it("should return false", function () {
            instance = new PremailerRequester();
            expect(instance.getDebug()).to.be(false);
        });
    });
    describe("#setDebug", function () {
        it("should return the instance", function () {
            instance = new PremailerRequester();
            expect(instance.setDebug(true)).to.be(instance);
        });
        it("should set debug on true", function () {
            instance = new PremailerRequester();
            instance.setDebug(true);
            expect(instance.getDebug()).to.be(true);
        });
    });
    describe("#getConvertToHTML", function () {
        it("should return true", function () {
            instance = new PremailerRequester();
            expect(instance.getConvertToHTML()).to.be(true);
        });
    });
    describe("#setConvertToHTML", function () {
        it("should return the instance", function () {
            instance = new PremailerRequester();
            expect(instance.setConvertToHTML(true)).to.be(instance);
        });
        it("should set convertToHTML on false", function () {
            instance = new PremailerRequester();
            instance.setConvertToHTML(false);
            expect(instance.getConvertToHTML()).to.be(false);
        });
    });
    describe("#getConvertToPlain", function () {
        it("should return false", function () {
            instance = new PremailerRequester();
            expect(instance.getConvertToPlain()).to.be(false);
        });
    });
    describe("#setConvertToPlain", function () {
        it("should return the instance", function () {
            instance = new PremailerRequester();
            expect(instance.setConvertToPlain(true)).to.be(instance);
        });
        it("should set convertToPlain on true", function () {
            instance = new PremailerRequester();
            instance.setConvertToPlain(true);
            expect(instance.getConvertToPlain()).to.be(true);
        });
    });
    describe("#run", function () {
        var exampleHTML = {html: "<html><head></head><body></body></html>"},
            reqMock = {
                on: function () {},
                end: function () {},
                setHeader: function () {}
            };

        function getHTTPMock(reqMock, res) {
            return {
                request: function (options, onSuccess) {
                    setTimeout(function () {
                        onSuccess(res); // simulating success
                    }, 0);
                    return reqMock;
                },
                get: function (url, onSuccess) {
                    setTimeout(function () {
                        onSuccess(res); // simulating success
                    }, 0);
                    return reqMock;
                }
            };
        }

        function getResponseMock(statusCode, responseData) {
            var onEnd;

            return {
                statusCode: statusCode,
                on: function (event, fn) {
                    if (event === "data") {
                        setTimeout(function () {
                            fn(responseData);
                            onEnd();
                        }, 0);
                    } else if (event === "end") {
                        onEnd = fn;
                    }
                },
                setEncoding: function () {}
            };
        }

        it("should complain when convertToHTML = false and convertToPlain = false", function (done) {
            var httpMock = {};

            function callback(err) {
                expect(err.constructor).to.be(Error);
                done();
            }

            instance = new PremailerRequester(httpMock, httpMock);
            instance
                .setConvertToHTML(false)
                .setConvertToPlain(false);
            instance.run({}, callback);
        });
        it("should complain when passing a non-object as data", function (done) {
            var httpMock = {};

            function callback(err) {
                expect(err.constructor).to.be(TypeError);
                done();
            }

            instance = new PremailerRequester(httpMock, httpMock);
            instance.run("abc", callback);
        });
        it("should send an appropiate post request", function (done) {
            var expectedData = "html=%3Chtml%3E%3Chead%3E%3C%2Fhead%3E%3Cbody%3E%3C%2Fbody%3E%3C%2Fhtml%3E",
                postReqMock = {
                    on: function () {},
                    end: function (data) {
                        expect(data).to.be(expectedData);
                        done();
                    },
                    setHeader: function (key, value) {
                        expect(key).to.be("Content-Length");
                        expect(value).to.be(expectedData.length);
                    }
                },
                httpMock = {
                    request: function (options) {
                        expect(options.host).to.be("premailer.dialect.ca");
                        expect(options.path).to.be("/api/0.1/documents");
                        expect(options.method).to.be("POST");
                        expect(options.headers["Content-Type"]).to.be("application/x-www-form-urlencoded");

                        return postReqMock;
                    }
                };

            function callback(err) {
                expect(err.constructor).to.be(TypeError);
                done();
            }

            instance = new PremailerRequester(httpMock, httpMock);
            instance.run(exampleHTML, callback);
        });
        it("should return the error on post request error", function (done) {
            var errorObj = {},
                postReqMock = {
                    on: function (event, fn) {
                        if (event === "error") {
                            setTimeout(function () {
                                fn(errorObj); // simulating an error
                            }, 0);
                        }
                    },
                    end: function () {},
                    setHeader: function () {}
                },
                httpMock = {
                    request: function () {
                        return postReqMock;
                    }
                };

            function callback(err) {
                expect(err).to.be(errorObj);
                done();
            }

            instance = new PremailerRequester(httpMock, httpMock);
            instance.run(exampleHTML, callback);
        });
        it("should handle error status codes on post requests", function (done) {
            var postResMock = getResponseMock(400),
                httpMock = getHTTPMock(reqMock, postResMock);

            function callback(err, response) {
                expect(err.constructor).to.be(Error);
                expect(response).to.be(postResMock);
                done();
            }

            instance = new PremailerRequester(httpMock, httpMock);
            instance.run(exampleHTML, callback);
        });
        it("should detect illegal jsons", function (done) {
            var postResMock = getResponseMock(201, "{illegaljson"),
                httpMock = getHTTPMock(reqMock, postResMock);

            function callback(err) {
                expect(err.constructor).to.be(SyntaxError);
                done();
            }

            instance = new PremailerRequester(httpMock, httpMock);
            instance.run(exampleHTML, callback);
        });
        it("should send an appropiate get html request", function (done) {
            var postResMock = getResponseMock(201, '{"documents": {"html": "http://example.com/URL_TO_REQUEST"}}'),
                httpMock = getHTTPMock(reqMock, postResMock);

            function callback() {}

            httpMock.get = function (options) {
                expect(options.host).to.be("example.com");
                expect(options.path).to.be("/URL_TO_REQUEST");
                done();
                return reqMock;
            };
            instance = new PremailerRequester(httpMock, httpMock);
            instance
                .setConvertToHTML(true)
                .setConvertToPlain(false);
            instance.run(exampleHTML, callback);
        });
        it("should send an appropiate get plain request", function (done) {
            var postResMock = getResponseMock(201, '{"documents": {"txt": "http://example.com/URL_TO_REQUEST"}}'),
                httpMock = getHTTPMock(reqMock, postResMock);

            function callback() {}

            httpMock.get = function (options) {
                expect(options.host).to.be("example.com");
                expect(options.path).to.be("/URL_TO_REQUEST");
                done();
                return reqMock;
            };
            instance = new PremailerRequester(httpMock, httpMock);
            instance
                .setConvertToHTML(false)
                .setConvertToPlain(true);
            instance.run(exampleHTML, callback);
        });
        it("should return the error on get html request error", function (done) {
            var errorObj = {},
                getReqMock = {
                    on: function (event, fn) {
                        if (event === "error") {
                            setTimeout(function () {
                                fn(errorObj); // simulating an error
                            }, 0);
                        }
                    },
                    end: function () {}
                },
                postResMock = getResponseMock(201, '{"documents": {"html": "URL_TO_REQUEST"}}'),
                httpMock = getHTTPMock(reqMock, postResMock);

            function callback(err) {
                expect(err).to.be(errorObj);
                done();
            }

            httpMock.get = function (url) {
                return getReqMock;
            };
            instance = new PremailerRequester(httpMock, httpMock);
            instance.run(exampleHTML, callback);
        });
        it("should handle error status codes on get requests", function (done) {
            var reqResMock = getResponseMock(400),
                postResMock = getResponseMock(201, '{"documents": {"html": "URL_TO_REQUEST"}}'),
                httpMock = getHTTPMock(reqMock, postResMock);

            function callback(err, response) {
                expect(err.constructor).to.be(Error);
                expect(response).to.be(reqResMock);
                done();
            }

            httpMock.get = function (url, onResponse) {
                onResponse(reqResMock);
                return postResMock;
            };
            instance = new PremailerRequester(httpMock, httpMock);
            instance.run(exampleHTML, callback);
        });
        it("should work with the real api", function (done) {
            function callback(err, html, plain) {
                expect(err).to.be(null);

                console.log(html);
                console.log(plain);

                done();
            }

            instance = new PremailerRequester();
            instance
                .setConvertToHTML(true)
                .setConvertToPlain(true)
                .setDebug(true);
            instance.run(exampleHTML, callback);
        });
    });
});
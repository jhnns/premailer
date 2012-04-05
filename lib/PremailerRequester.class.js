"use strict"; // run code in ES5 strict mode

var json2form = require("./json2form.js"),
    urlUtil = require("url");

/**
 * Sends the request and handles the response
 *
 * @param {Object=require("http")} httpModule mockable http module
 * @constructor
 */
function PremailerRequester(httpModule, httpsModule) {
    var Properties = {},
        Public = this;

    /**
     * @private
     * @type {Object<String, String|Object>}
     */
    Properties.__postRequestOptions = {
        host: "premailer.dialect.ca",
        path: "/api/0.1/documents",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    /**
     * @private
     * @type {Boolean}
     */
    Properties.__debug = false;

    /**
     * @private
     * @type {Boolean=true}
     */
    Properties.__convertToHTML = true;

    /**
     * @private
     * @type {Boolean=false}
     */
    Properties.__convertToPlain = false;

    /**
     * Constructor
     */
    function construct() {
        httpModule = httpModule || require("http");
        httpsModule = httpsModule || require("https");
    }

    /**
     * @public
     * @param {Boolean} debug
     * @return {PremailerRequester}
     */
    Public.setDebug = Properties.setDebug = function (debug) {
        this.__debug = Boolean(debug);
        return Public;
    }.bind(Properties);

    /**
     * @public
     * @return {Boolean}
     */
    Public.getDebug = Properties.getDebug = function () {
        return this.__debug;
    }.bind(Properties);

    /**
     * @public
     * @param {Boolean} convertToHTML
     * @return {PremailerRequester}
     */
    Public.setConvertToHTML = Properties.setConvertToHTML = function (convertToHTML) {
        this.__convertToHTML = Boolean(convertToHTML);
        return Public;
    }.bind(Properties);

    /**
     * @public
     * @return {Boolean}
     */
    Public.getConvertToHTML = Properties.getConvertToHTML = function () {
        return this.__convertToHTML;
    }.bind(Properties);

    /**
     * @public
     * @param {Boolean=false} convertToPlain
     * @return {PremailerRequester}
     */
    Public.setConvertToPlain = Properties.setConvertToPlain = function (convertToPlain) {
        this.__convertToPlain = Boolean(convertToPlain);
        return Public;
    }.bind(Properties);

    /**
     * @public
     * @return {Boolean=false}
     */
    Public.getConvertToPlain = Properties.getConvertToPlain = function () {
        return this.__convertToPlain;
    }.bind(Properties);

    /**
     * @private
     * @param {String} msg
     */
    Properties.__log = function (msg) {
        if (this.__debug) {
            console.log(msg);
        }
    }.bind(Properties);

    /**
     * @private
     * @param {!Object} response
     * @param {!Function} callback
     */
    Properties.__handleErrorStatusCode = function (response, callback) {
        var msg;

        switch (response.statusCode) {
            case 400: msg = "Content missing"; break;
            case 403: msg = "Access forbidden"; break;
            case 404: msg = "Not found"; break;
            default: msg = "Unknown error"; break;
        }
        msg = response.statusCode + " " + msg;
        this.__log("Request error: " + msg);
        callback(new Error(msg), response);
    }.bind(Properties);

    /**
     * GETs the converted mail
     *
     * @private
     * @param {!String} url
     * @param {!Function} callback
     * @return {}
     */
    Properties.__doGetRequest = function (url, callback) {
        var self = this,
            getReq,
            getRes,
            getResData = "";

        function onGetReponseEnd() {
            self.__log("Response from " + url + ":");
            self.__log(getResData);
            callback(null, getResData);
        }

        function onGetReponseData(chunk) {
            getResData += chunk;
        }

        function onGetResponse(res) {
            self.__log("Receiving ...");
            if (res.statusCode === 200) {
                getRes = res;
                res.setEncoding("utf8");
                res.on("data", onGetReponseData);
                res.on("end", onGetReponseEnd);
            } else {
                self.__handleErrorStatusCode(res, callback);
            }
        }

        function onGetRequestError(err) {
            err.message = "Unexpected request error: " + err.message;
            self.__log(err.message);
            callback(err);
        }

        url = urlUtil.parse(url);
        this.__log("Starting get request");
        getReq = httpsModule.get(
            {
                host: url.host,
                path: url.path
            },
            onGetResponse
        );
        this.__log(getReq.output);
        getReq.on("error", onGetRequestError);
    }.bind(Properties);

    /**
     * POSTs to the API
     *
     * @private
     * @param {!String} data
     * @param {!Function} callback
     */
    Public.__doPostRequest = Properties.__doPostRequest = function (data, callback) {
        var self = this,
            postReq,
            postRes,
            postResData = "";

        function onPostResponseEnd() {
            self.__log("Response from " + self.__postRequestOptions.host + ":");
            self.__log(postResData);

            try {
                postResData = JSON.parse(postResData);
            } catch (parseError) {
                parseError.message = "Error while parsing the response as json: " + parseError.message;
                self.__log(parseError.message);
                callback(parseError);

                return;
            }

            callback(null, postResData);
        }

        function onPostReponseData(chunk) {
            postResData += chunk;
        }

        function onPostResponse(res) {
            self.__log("Receiving ...");
            if (res.statusCode === 201) {
                postRes = res;
                res.setEncoding("utf8");
                res.on("data", onPostReponseData);
                res.on("end", onPostResponseEnd);
            } else {
                self.__handleErrorStatusCode(res, callback);
            }
        }

        function onPostRequestError(err) {
            err.message = "Unexpected request error: " + err.message;
            self.__log(err.message);
            callback(err);
        }

        postReq = httpModule.request(this.__postRequestOptions, onPostResponse);
        postReq.setHeader("Content-Length", data.length);
        postReq.on("error", onPostRequestError);
        this.__log("Starting post request ...");
        postReq.end(data);
        this.__log(postReq.output);
    }.bind(Properties);

    /**
     * POSTs to the API and GETs the converted mail. The callback will be called
     * with [err, result]
     *
     * @public
     * @param {!Object} data the data to send as json
     * @param {!Function} callback
     */
    Public.run = Properties.run = function (data, callback) {
        var formEncoded,
            err,
            htmlResult,
            plainResult,
            pending = 0,
            self = this;

        function doCallback() {
            if (pending === 0) {
                callback(null, htmlResult, plainResult);
            }
        }

        function onGetHTMLResponse(err, response) {
            pending--;
            if (err) {
                callback(err, response);
                return;
            }
            htmlResult = response;
            doCallback();
        }

        function onGetPlainResponse(err, response) {
            pending--;
            if (err) {
                callback(err, response);
                return;
            }
            plainResult = response;
            doCallback();
        }

        function onPostResponse(err, response) {
            if (err) {
                callback(err, response);
                return;
            }

            if (self.__convertToHTML) {
                pending++;
                self.__doGetRequest(response.documents.html, onGetHTMLResponse);
            }
            if (self.__convertToPlain) {
                pending++;
                self.__doGetRequest(response.documents.txt, onGetPlainResponse);
            }
        }

        if (self.__convertToHTML === false && self.__convertToPlain === false) {
            err = new Error("You don't seem to be interested in the result: convertToHTML = false and convertToPlain = false.");
            this.__log(err.message);
            callback(err);

            return;
        }
        this.__log("Converting json to x-www-form-urlencoded ...");
        try {
            formEncoded = json2form(data);
        } catch (encodingError) {
            encodingError.message = "Error while encoding the data to send: " + encodingError.message;
            this.__log(encodingError.message);
            callback(encodingError);

            return;
        }

        this.__doPostRequest(formEncoded, onPostResponse);
    }.bind(Properties);

    construct();
}

module.exports = PremailerRequester;
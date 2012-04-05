"use strict"; // run code in ES5 strict mode

/**
 * Simple API-wrapper that sends requests to http://premailer.dialect.ca/api/0.1/documents
 * 
 * @constructor
 */
function Premailer(customHttp) {
    var Properties = {},
        Public = this,
        http;
    
    /**
     * @private
     * @type {Object<String, String|Number|Boolean>}
     */
    Properties.options = {};
    
    /**
     * Constructor
     */
    function construct() {
        http = customHttp || require("http");
    }

    /**
     * Which document handler to use
     * 
     * @public
     * @param {!String} adapter
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setAdapter = Properties.setAdapter = function (adapter) {
        if (typeof adapter !== "string") {
            throw new TypeError("adapter must be typeof string");
        }

        this.options.adapter = adapter;
        
        return Public;
    }.bind(Properties);
    
    /**
     * Base URL for converting relative links
     * 
     * @public
     * @param {!String} baseURL
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setBaseURL = Properties.setBaseURL = function (baseURL) {
        if (typeof baseURL !== "string") {
            throw new TypeError("baseURL must be typeof string");
        }

        this.options.base_url = baseURL;

        return Public;
    }.bind(Properties);

    /**
     * Length of lines in the plain text version
     *
     * @public
     * @param {!String} lineLength
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setLineLength = Properties.setLineLength = function (lineLength) {
        if (typeof lineLength !== "number") {
            throw new TypeError("lineLength must be typeof number");
        }
        lineLength = parseInt(lineLength, 10);
        if (isNaN(lineLength)) {
            throw new TypeError("lineLength could not be parsed to an integer");
        }

        this.options.line_length = lineLength;

        return Public;
    }.bind(Properties);

    /**
     * Query string appended to links
     *
     * @public
     * @param {!String} linkQueryString
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setLinkQueryString = Properties.setLinkQueryString = function (linkQueryString) {
        if (typeof linkQueryString !== "string") {
            throw new TypeError("linkQueryString must be typeof string");
        }

        this.options.link_query_string = linkQueryString;

        return Public;
    }.bind(Properties);

    /**
     * Whether to preserve any link rel=stylesheet and style elements
     *
     * @public
     * @param {!Boolean} preserveStyles
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setPreserveStyles = Properties.setPreserveStyles = function (preserveStyles) {
        if (typeof preserveStyles !== "boolean") {
            throw new TypeError("preserveStyles must be typeof boolean");
        }

        this.options.preserve_styles = preserveStyles;

        return Public;
    }.bind(Properties);

    /**
     * Remove IDs from the HTML document?
     *
     * @public
     * @param {!String} removeIds
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setRemoveIds = Properties.setRemoveIds = function (removeIds) {
        if (typeof removeIds !== "boolean") {
            throw new TypeError("removeIds must be typeof boolean");
        }

        this.options.remove_ids = removeIds;

        return Public;
    }.bind(Properties);

    /**
     * Remove classes from the HTML document?
     *
     * @public
     * @param {!String} removeClasses
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setRemoveClasses = Properties.setRemoveClasses = function (removeClasses) {
        if (typeof removeClasses !== "boolean") {
            throw new TypeError("removeClasses must be typeof boolean");
        }

        this.options.remove_classes = removeClasses;

        return Public;
    }.bind(Properties);

    /**
     * Remove classes from the HTML document?
     *
     * @public
     * @param {!String} removeComments
     * @throws {TypeError}
     * @return {Premailer}
     */
    Public.setRemoveComments = Properties.setRemoveComments = function (removeComments) {
        if (typeof removeComments !== "boolean") {
            throw new TypeError("removeComments must be typeof boolean");
        }

        this.options.remove_comments = removeComments;

        return Public;
    }.bind(Properties);

    /**
     * Returns the current options
     *
     * @public
     * @param {String} paramName place your param description here
     * @return {Object<String, String|Number|Boolean>}
     */
    Public.getOptions = Properties.getOptions = function () {
        return this.options;
    }.bind(Properties);

    construct();
}

Premailer.API_VERSION = "0.1";

module.exports = Premailer;
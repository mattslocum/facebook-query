/**
 * @license Facebook Query API v0.1
 * (c) 2014 Matt Slocum
 * License: MIT
 */
!function (name, context, definition) {
    // CommonJS
    if (typeof module != 'undefined' && module.exports) module.exports = definition();
    // AMD
    else if (typeof define == 'function' && define.amd) define(definition);
    // <script>
    else context[name] = definition()
}('facebookQuery', this, function () {
    'use strict';

    /**
     * facebookQuery public class.
     * This should be instantiated without an argument.
     * @param {string=} strField
     * @returns {facebookQuery}
     * @constructor
     **/
    var facebookQuery = function(strField) {
        if (strField) {
            /**
             * @static
             * @type {string}
             */
            this.strField = strField;
            /**
             * @static
             * @type {boolean}
             */
            this.bRootField = false;
        } else {
            this.bRootField = true;
        }
        this.aFields = [];
        this.iLimit = 0;
        return this;
    };

    /**
     * The name of the field. May be undefined if on the top level.
     * @returns {(string|undefined)}
     */
    facebookQuery.prototype["getName"] = function() {
        return this.strField;
    };

    /**
     * Add a field to the current query level
     * @param {(string|facebookQuery)} oField
     * @returns {facebookQuery}
     */
    facebookQuery.prototype["addField"] = function(oField) {
        if (typeof oField == "string") {
            oField = new facebookQuery(oField);
        }
        this.aFields.push(oField);
        return oField;
    };

    /**
     * searches the current query for a requested field
     * @param {string} strField
     * @returns {facebookQuery}
     */
    facebookQuery.prototype["getField"] = function(strField) {
        var oFound = null;
        this.aFields.some(function(oField) {
            if (oField.getName() == strField) {
                oFound = oField;
                return true;
            }
        });
        return oFound;
    };

    /**
     * Set multiple requested fields at once using an array of strings.
     * @param {[string]} aFields
     * @returns {facebookQuery|Array}
     */
    facebookQuery.prototype["fields"] = function(aFields) {
        /**
         * @type {facebookQuery}
         */
        var self = this;
        // TODO: Do we need to check for type array?
        if (typeof aFields == "undefined") {
            return self.aFields;
        }
        self.aFields = [];
        aFields.forEach(function(strField) {
            self.addField(strField);
        });
        return self;
    };

    /**
     * Returns an array of requested field names.
     * @returns {[string]}
     */
    facebookQuery.prototype["fieldNames"] = function() {
        return this.aFields.map(function(oField) {
            return oField.getName();
        });
    };

    /**
     * If an argument is given, sets the limit of response objects.
     * If no argument it returns what is set.
     * FB often defaults to 25.
     * @param {number} iLimit
     * @returns {(facebookQuery|number|undefined)}
     */
    facebookQuery.prototype["limit"] = function(iLimit) {
        if (typeof iLimit == "undefined") {
            return this.iLimit; // int or undefined
        }
        this.iLimit = iLimit;
        return this;
    };

    /**
     * Returns the string of the query and all its fields.
     * @returns {string}
     */
    facebookQuery.prototype["toString"] = function() {
        var self = this;
        if (self.bRootField) {
            return "fields=" + self.aFields.join(',');
        } else {
            var strRetval = self.strField;
            if (self.iLimit) {
                strRetval += ".limit(" + self.iLimit +")";
            }
            if (self.aFields.length) {
                strRetval += ".fields(" + self.aFields.join(',') + ")";
            }
            return strRetval;
        }
    };

    /**
     * Prints out a friendly JSON.stringify response
     * @returns {Object}
     */
    facebookQuery.prototype["toJSON"] = function() {
        var oRetval = {};
        if (this.aFields.length) {
            oRetval["fields"] = this.aFields;
        }
        if (this.strField) {
            oRetval["name"] = this.strField;
        }
        if (this.iLimit) {
            oRetval["limit"] = this.iLimit;
        }
        return oRetval;
    };

    /**
     * Enter Facebook's response to populate all fields with the requested data.
     * @param {(string|Object)} mRaw - JSON string or object
     * @returns {facebookQuery}
     */
    facebookQuery.prototype["parseResponse"] = function(oRaw) {
        var self = this,
            mValue,
            strKey;

        if (typeof oRaw == "string") {
            oRaw = JSON.parse(oRaw);
        }
        self.mData = oRaw.data || oRaw;
        self.id = oRaw.id; // might be undefined
        self.oPaging = oRaw.paging; // might be undefined
        self.aDataFields = [];

        if (Array.isArray(self.mData)) {
            var aNewData = [];
            self.mData.forEach(function(oData) {
                aNewData.push(
                    (new facebookQuery(self.getName())).parseResponse(oData)
                )
            });
            self.mData = aNewData;
        } else if (typeof self.mData == "object") {
            for (strKey in self.mData) {
                if (self.mData.hasOwnProperty(strKey)) {
                    self.aDataFields.push(strKey);
                    if (self.mData[strKey].data) {
                        self.mData[strKey] = (new facebookQuery(strKey)).parseResponse(self.mData[strKey]);
                    }
                }
            }
        }

        return self;
    };

    /**
     * Get the parsed data result.
     * If a specific key of the requested data is requested return that.
     * If the requested key has subData, then return the subData.
     * @param {=string} strKey
     * @returns {Object}
     */
    facebookQuery.prototype["data"] = function(strKey) {
        return strKey ?
            ( typeof this.mData[strKey] == "object" && this.mData[strKey].hasData() ?
                this.mData[strKey].data() :
                this.mData[strKey]
            ) :
            this.mData;
    };

    /**
     * Returns true if the facebookQuery object has any data.
     * TODO: make this more helpful for strings and integers.
     * @returns {boolean}
     */
    facebookQuery.prototype["hasData"] = function() {
        return typeof this.mData == "object";
    };

    /**
     * Returns an array of fields available
     * @returns {Array}
     */
    facebookQuery.prototype["dataFields"] = function() {
        return this.aDataFields;
    };

    /**
     * Get the parsed data result
     * @param {string} strKey
     * @returns {Object}
     */
    facebookQuery.prototype["getID"] = function() {
        return this.id;
    };

    /**
     * Get the paging data
     * @returns {Object}
     */
    facebookQuery.prototype["paging"] = function() {
        // TODO: give more paging options.
        return this.oPaging;
    };

    return facebookQuery;
});
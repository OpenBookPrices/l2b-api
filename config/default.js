"use strict";

var path = require("path");

module.exports = {
  retryDelayForPending: 2,
  retryDelayForStale: 2,
  retryDelayForError: 2,
  retryDelayForUnfetched: 0,

  minimumMaxAgeForPrices: 30,

  getBookPricesForVendorTimeout: 4,

  fallbackCountry:  "US",
  fallbackCurrency: "USD",

  pathToConfigFiles: path.resolve(__dirname),

  exchangeReloadIntervalSeconds: 600, // 10 mins

  api: {
    urlBase: "http://api.openbookprices.com",
  }
};

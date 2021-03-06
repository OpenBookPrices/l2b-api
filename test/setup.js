"use strict";

var sinon   = require("sinon"),
    config = require("config"),
    path = require("path"),
    getter = require("../src/getter"),
    client = require("../src/redis-client"),
    logger = require("../src/logger"),
    samples = require("./samples"),
    fetcher = require("openbookprices-fetchers"),
    exchange = require("../src/exchange");

// set the environment to testing
var envKey = "NODE_ENV";
process.env[envKey] = "testing";

// Put the getter into test mode. This means using a nonstandard redis database
// and flushing it.
beforeEach(function (done) {
  getter.enterTestMode(done);
  logger.level("fatal");
});

// Create a fresh Sinon sandbox before every test
beforeEach(function () {
  var sandbox = this.sandbox = sinon.sandbox.create({ useFakeTimers: true });
  sandbox.clock.tick(samples("zeroTime"));

  this.waitForCache = function (cb) {
    var commandQueue = "command_queue";
    if ( client[commandQueue].length === 0) {
      return cb();
    }
    client.once("idle", function () {
      client.ping(cb);
    });
  };

  this.delay = function (delay) {
    return function (cb) {
      setTimeout(cb, delay);
      sandbox.clock.tick(delay);
    };
  };

  // Stub the tester so that we only use our test vendors.
  sandbox
    .stub(fetcher, "allVendorCodes")
    .returns(["test_vendor_1", "test-vendor-2"]);

  // Stub the vendorDetails for our fake vendors.
  sandbox
    .stub(fetcher, "vendorDetails")
    .withArgs("test_vendor_1").returns({
      code: "test_vendor_1",
      name: "Test Vendor 1",
      homepage: "http://www.test-vendor-1.co.uk/",
    });

  // stub the country so that only test_vendor_1 is returned
  var vendorsForCountry = this.sandbox
    .stub(fetcher, "vendorsForCountry");
  vendorsForCountry.withArgs("GB").returns(["test_vendor_1"]);
  vendorsForCountry.withArgs("US").returns(["test_vendor_1"]);

  // stub the currencies
  this.sandbox
    .stub(fetcher, "currencyForVendor")
    .withArgs("test_vendor_1").returns(["GBP"]);

  // stubs the exchange rates pathToLatestJSON to use the test file
  var initialJSON = path.join(config.pathToConfigFiles, "initial_exchange_rates.json");
  var relativeJSON = path.relative(process.cwd(), initialJSON);
  this.sandbox
    .stub(exchange, "pathToLatestJSON")
    .returns(relativeJSON);

  // load the rates
  exchange.loadLatestJSON();


});

// Clean up the sandbox.
afterEach(function () {
  this.sandbox.restore();
});


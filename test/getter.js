"use strict";

require("./setup");

var assert = require("assert"),
    async = require("async"),
    fetcher = require("l2b-price-fetchers"),
    getter = require("../src/getter"),
    samples = require("./samples");


describe("Getter", function () {

  beforeEach(function () {
    // stub the fetch so that it does not do a scrape
    this.fetchStub = this.sandbox.stub(fetcher, "fetch").yields(
      null,
      samples.fetch["9780340831496"]
    );
  });

  it("should get book details, then cache", function (done) {
    var test = this;

    var runTests = function (cb) {
      getter.getBookDetails("9780340831496", function (err, details) {
        assert.ifError(err);
        assert.deepEqual(details, samples.getBookDetails["9780340831496"]);
        cb();
      });
    };

    async.series(
      [
        // Fetch the book data twice, with a slight delay to let redis cache
        runTests,
        test.waitForCache,
        runTests,

        // Check that the scape only happened once
        function (cb) {
          assert.equal(test.fetchStub.callCount, 1);
          cb();
        }
      ],
      done
    );
  });

  it("should get book price, then cache", function (done) {

    var test = this;

    var runTests = function (cb) {
      getter.getBookPricesForVendor(
        { isbn: "9780340831496", vendor: "foyles", country: "GB", currency: "GBP"},
        function (err, details) {
          assert.ifError(err);
          assert.deepEqual(
            details,
            samples.getBookPricesForVendor["9780340831496"]
          );
          cb();
        }
      );
    };

    async.series(
      [
        // Fetch the book data twice, with a slight delay to let redis cache
        runTests,
        test.waitForCache,
        runTests,

        // Check that the scape only happened once
        function (cb) {
          assert(test.fetchStub.calledOnce);
          cb();
        }
      ],
      done
    );
  });

});


/**
 * Protractor connfiguration file.
 *
 * This file contain basic options to setup protractor testing with
 * SauceLabs integration.
 *
 * To explore all condfiguration options visit:
 * https://github.com/angular/protractor/blob/master/docs/referenceConf.js
 */

exports.config = {

  // Saucelabs credentials.
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  
  // Tests to run
  specs: [
    '**/*.js'
  ],

  // Single Browser
  // capability: [
  //   browserName: 'chrome',
  //   name: 'Testing with chrome',
  //   specs: [],
  // ]

  // Multiple Browsers
  multiCapabilities: [
    {
      browserName: 'chrome',
      name: 'Testing with chrome'
    },
    {
      browserName: 'firefox',
      name: 'Testing with firefox'
    }
  ],

  params: {
    url: ''
  },

  // Options to be passed to jasmine-node.
  jasmineNodeOpts: {
    // If true, print colors to the terminal.
    showColors: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 30000
  }

};

define(function(require) {

    var intern = require('intern');

    var seleniumConfigs = require('./config/selenium');
    var browsersConfig = require('./config/browsers');
    var testsConfig = require('./config/testsConfig');

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Selenium configuration

    //var seleniumConfig = seleniumConfigs.remote;
	var seleniumConfig = seleniumConfigs.local;
	
    var conf = {
        // Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
        // OnDemand. Options that will be permutated are browserName, version; any other
        // capabilities options specified for an environment will be copied as-is
        environments: browsersConfig[intern.args.browsers],

        // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
        maxConcurrency: 1,

        // Functional test suite(s) to run in each browser once non-functional tests are completed
        functionalSuites: [
            'test/functional/tests/multipleAds/testSuite'
        ],

        // The amount of time, in milliseconds, an asynchronous test can run before it is considered timed out. By default this value is 30 seconds.
        defaultTimeout: 60000,

        // A regular expression matching URLs to files that should not be included in code coverage analysis
        excludeInstrumentation : /^tests|test|node_modules/,
    };

    // Selenium configuration from command line
    if (intern.args.selenium) {
        seleniumConfig = seleniumConfigs[intern.args.selenium];
    }

    conf = Object.assign(conf, seleniumConfig);

    return conf;
});

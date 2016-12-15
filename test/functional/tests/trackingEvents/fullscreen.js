/**
 TEST_EVT_FULLSCREEN:

- load test page
- for each stream:
    - load stream
    - request full screen and exit full screen
    - wait the end of the ads
    - check received tracking events
**/

define([
    'intern!object',
    'intern/chai!assert',
    'require',
    'test/functional/config/testsConfig',
    'test/functional/tests/player_functions',
    'test/functional/tests/tests_functions'
    ], function(registerSuite, assert, require, config, player, tests) {

        // Suite name
        var NAME = 'TEST_EVT_FULLSCREEN';
        var intern = require('intern');

        // Test configuration (see config/testConfig.js)
        var testConfig = config.tests.trackingEvents.fullscreen,
            streams = testConfig.streams;

        // Test constants
        var ADS_DURATION = config.adsDuration; // ads duration (in s)

        // Test variables
        var command = null;

        var testSetup = function (stream) {
            var sleepTime = 3;

            registerSuite({
                name: NAME,

                setup: function() {
                    tests.log(NAME, 'Setup');

                    //tests.log(NAME, 'intern.args.browsers='+intern.args.browsers);
                    // Skip entire suite if running in a edge browser
                    if (intern.args.browsers === 'edge_windows10'){
                        this.skip('skipped on browser Edge');
                    }

                    command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                    command = tests.setup(command);
                    return command;
                },

                //beforeEach: function () {
                //    console.log('outer beforeEach');
                //},

                loadStream: function() {
                    tests.logLoadStream(NAME, stream);
                    return command.execute(player.loadStream, [stream])
                },

                requestFullscreen: function () {
                    return command.sleep(sleepTime * 1000)
                        .then(function() {
                            tests.log(NAME, 'Wait ' + sleepTime + ' sec. and request Fullscreen');
                            return command.findByCssSelector('.button-fullscreen').click();
                        })
                    /*this.remote.setFindTimeout(5000).findByCssSelector('.button-fullscreen').click().end();*/
                },

                exitFullscreen: function () {
                    return command.sleep(sleepTime * 1000)
                        .then(function() {
                            tests.log(NAME, 'Wait ' + sleepTime + ' sec. and exit Fullscreen');
                            return command.findByCssSelector('.button-fullscreen').click();
                        })
                },

                checkTrackingEvents: function () {
                    tests.log(NAME, 'wait end of ads - ' + ADS_DURATION);
                    return command.sleep(ADS_DURATION * 1000)
                     .then(function() {
                        return command.execute(player.getReceivedTackingEvents);
                    })
                    .then(function (receivedTackingEvents) {
                        // Compare TackingEvents arrays
                        var res = tests.checkTrackingEvents(stream.ExpectedtrackingEvents,receivedTackingEvents);
                        if (!res) {
                            tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                            tests.log(NAME, 'expected tracking events: ' + JSON.stringify(stream.ExpectedtrackingEvents));
                        }
                        assert.isTrue(res);
                    });
                }
            });
        };


        for (var i = 0; i < streams.length; i++) {
            // setup: load test page and stream
            testSetup(streams[i]);
        }

});

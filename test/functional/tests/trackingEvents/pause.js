/**
 TEST_EVT_PAUSE:

- load test page
- for each stream:
    - load stream
    - pause the ads player
    - check if <ads> is paused
    - check if <ads> is not progressing
    - resume the ads player
    - wait the end of the ads
    - check received tracking events
**/

define([
    'intern!object',
    'intern/chai!assert',
    'require',
    'test/functional/config/testsConfig',
    'test/functional/tests/player_functions',
    'test/functional/tests/ads_functions',
    'test/functional/tests/tests_functions'
    ], function(registerSuite, assert, require, config, player, ads, tests) {

        // Suite name
        var NAME = 'TEST_EVT_PAUSE';

        // Test configuration (see config/testConfig.js)
        var testConfig = config.tests.trackingEvents.pause,
            streams = testConfig.streams;

        // Test constants
        var PAUSE_DELAY = 5; // Delay (in s) for checking is player is still paused (= not progressing)
        
        // Test variables
        var command = null,
            i, j;

        var testSetup = function (stream) {
            registerSuite({
                name: NAME,

                setup: function() {
                    tests.log(NAME, 'Setup');
                    command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                    command = tests.setup(command);
                    return command;
                },

                play: function() {
                    tests.logLoadStream(NAME, stream);
                    return command.execute(player.loadStream, [stream])
                }
            });
        };

        var test = function (stream) {

            registerSuite({
                name: NAME,

                pause: function () {
                    var currentTime = 0;
                    var sleepTime = 5;

                    tests.log(NAME, 'Wait ' + sleepTime + ' sec. and pause the ads player');
                    return command.sleep(sleepTime * 1000).execute(ads.pause)
                    .then(function () {
                        tests.log(NAME, 'Check if paused');
                        return command.execute(ads.isPaused);
                    })
                    .then(function (paused) {
                        assert.isTrue(paused);
                        return command.execute(ads.getCurrentTime);
                    })
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Check if not progressing');
                        tests.log(NAME, 'Current time = ' + time );
                        return command.sleep(PAUSE_DELAY * 1000);
                    })
                    .then(function () {
                        return command.execute(ads.getCurrentTime);
                    })
                    .then(function (time) {
                        tests.log(NAME, 'Current time = ' + time);
                        assert.strictEqual(time, currentTime);
                        tests.log(NAME, 'Resume the ads player');
                        return command.execute(ads.play);
                    })
                    .then(function () {
                        return command.execute(ads.getDuration);
                    })
                    .then(function (adsDuration) {
                        tests.log(NAME, 'wait end of ads - ' + adsDuration);
                         return command.sleep(adsDuration * 1000);
                    })
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


        for (i = 0; i < streams.length; i++) {
            // setup: load test page and stream
            testSetup(streams[i]);
            // Performs pause tests
            test(streams[i]);
        }

});

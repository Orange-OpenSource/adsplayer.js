/**
 TEST_EVT_PLAY:

- for each stream:
    - load test page
    - load stream
    - wait the end of the ads
    - check if tracking events have been received
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
        var NAME = 'TEST_EVT_PLAY';

        // Test configuration (see config/testConfig.js)
        var testConfig = config.tests.trackingEvents.play,
            streams = testConfig.streams;

        // Test constants
        var ADS_DURATION = config.adsDuration; // ads duration (in s)

        // Test variables
        var command = null;

        var test = function(stream) {

            registerSuite({
                name: NAME,

                setup: function() {
                    tests.log(NAME, 'Setup');
                    command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                    command = tests.setup(command);
                    return command;
                },

                loadStream: function() {
                    tests.logLoadStream(NAME, stream);
                    return command.execute(player.loadStream, [stream]);
                },

                playing: function() {
                    tests.log(NAME, 'wait end of ads - ' + ADS_DURATION);
                    return command.sleep(2 * ADS_DURATION * 1000)
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
            test(streams[i]);
        }
});

/**
TEST_EVT_MUTE:

- load test page
- for each stream:
    - load stream
    - mute the player
    - check if <player> is muted
    - unmute the player
    - check if <player> is unmuted
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
        var NAME = 'TEST_EVT_MUTE';

        // Test configuration (see config/testConfig.js)
        var testConfig = config.tests.trackingEvents.mute,
            streams = testConfig.streams;

        // Test constants
        var ADS_DURATION = config.adsDuration; // ads duration (in s)

        // Test variables
        var command = null,
            i;

        var testSetup = function (stream) {
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
                    return command.execute(player.loadStream, [stream])
                }
            });
        };

        var test = function (stream) {
            var sleepTime = 2;

            registerSuite({
                name: NAME,

                mute: function () {
                    tests.log(NAME, 'Wait ' + sleepTime + ' sec. and mute the player');
                    return command.sleep(sleepTime * 1000).execute(player.setMute, [true])
                        .then(function () {
                            tests.log(NAME, 'Check if player is muted');
                            return command.execute(player.getMute);
                        })
                        .then(function (isPlayerMuted) {
                            tests.log(NAME, 'Check if player is muted : ' + isPlayerMuted);
                            assert.isTrue(isPlayerMuted);
                        })
                },

                unmute: function () {
                    tests.log(NAME, 'Wait ' + sleepTime + ' sec. and unmute the player');
                    return command.sleep(sleepTime * 1000).execute(player.setMute, [false])
                        .then(function () {
                            return command.execute(player.getMute);
                        })
                        .then(function (isPlayerMuted) {
                            tests.log(NAME, 'Check if player is unmuted : ' + isPlayerMuted);
                            assert.isFalse(isPlayerMuted);
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


        for (i = 0; i < streams.length; i++) {
            // setup: load test page and stream
            testSetup(streams[i]);
            // Performs pause tests
            test(streams[i]);
        }

});

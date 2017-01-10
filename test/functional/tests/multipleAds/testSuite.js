/**
 TEST_MULTIPLE_ADS_IN_MAST:

Check the adsPlugin behaviour when the mast file embeds more than one ad

 **/
define(function(require) {
    var intern = require('intern');
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');
    var config = require('test/functional/config/testsConfig');

    // Extract the media filename from an url
    // For example if url is http://localhost/csadsplugin/samples/ads/xml/vast-3/../../media/vo_ad_2.mp4
    // getMediaFileName returns vo_ad_2.mp4
    var getMediaFileName = function(url){
        var array = url.split("/");
        return array[array.length-1];
    }

    registerSuite(function(){

        var command = null;

        return {

            name: "TEST_MULTIPLE_ADS",

            setup: function () {
                // executes before suite starts;

                // load the web test page
                command = this.remote.get(require.toUrl(config.testPageUrl));

                // set the stream to play
                command.findById("stream_toplay").type(config.streamUrl);

                return command;
            },

            beforeEach: function (test) {
                // executes before each test

                return (command
                    // type the ad url
                    .findById("ad_toplay").type(config.tests.multipleAds[test.name].mastUrl)
                    .end()
                    // start the player
                    .findById("play_button").click()
                    .end()
                    // wait for the event start
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_start').value === "1" ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event started has been detected
                    }, function (error) {
                        // the event started has NOT been detected
                        assert.isFalse(true);
                    })
                );
            },

            afterEach: function (test) {
                // executes after each test
                return (command
                // wait for the event end
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_end').value === "1" ? true : null;
                    }, null, 40000, 1000))
                    .then(function () {
                        // the event end has been detected
                    }, function (error) {
                        // the event end has NOT been detected
                        assert.isFalse(true);
                    })
                    //stop the player
                    .findById("stop_button").click()
                    .end()
                    //clear the ad url
                    .findById("ad_toplay").clearValue()
                    .end()
                );
            },

            // Test an ad pod:
            // Check that the first and the second ads are played in the right order
            "adPod": function () {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src) {
                                assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.adPod.ads[0].media));
                            })
                        .end()
                    .end()
                .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                // wait for the play event
                // Check the expected ad is played
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true);
                        })
                        .findById("adsplayer-container")
                            .findByTagName("video")
                                .getAttribute("src")
                                .then(function (src) {
                                    assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.adPod.ads[1].media));
                                })
                            .end()
                        .end()
                );
            },

            // Test a vast xml file with 2 ads but outside an ad pod
            // The 2 ads are played in the order they appear in the xml file.
            "doubleAdsInVast": function () {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src){assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdsInVast.ads[0].media));})
                        .end()
                    .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                // wait for the play event
                // Check the expected ad is played
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true);
                        })
                        .findById("adsplayer-container")
                        .findByTagName("video")
                        .getAttribute("src")
                        .then(function (src){
                            assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdsInVast.ads[1].media));
                        })
                        .end()
                        .end()
                );
            },

            // Test a mast xml file with 2 triggers
            "doubleTriggersInMast": function () {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleTriggersInMast.ads[0].media));})
                        .end()
                    .end()

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                return (command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true);
                        })
                        .findById("adsplayer-container")
                            .findByTagName("video")
                                .getAttribute("src")
                                .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleTriggersInMast.ads[1].media));})
                            .end()
                        .end()
                );
            },

            // Test a mast xml file with 1 trigger with 2 Vasts xml files
            "doubleVastsInTrigger": function () {

                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleVastsInTrigger.ads[0].media));})
                        .end()
                    .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true);
                    });

                return (command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true);
                        })
                        .findById("adsplayer-container")
                            .findByTagName("img")
                                .getAttribute("src")
                                .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleVastsInTrigger.ads[1].media));})
                            .end()
                        .end()
                );
            }
        };
    });
});

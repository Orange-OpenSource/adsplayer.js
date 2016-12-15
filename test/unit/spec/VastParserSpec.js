/**
 *  Created by Viaccess-Orca on 11/16/16.
 *
 *  This is a JASMINE test description.
 *
 *  Class under test: VastParser.js
 *  Prerequisite: http://cswebplayer.viaccess.fr/adsserver/xml/vast-3/VAST3-AdPods.xml
 */

"use strict";
describe("VastParser", function() {
    var vastParser = null;
    var xmlLoader = null;
    var vast = null;
    var url = "http://cswebplayer.viaccess.fr/adsserver/xml/vast-3/VAST3-AdPods.xml";

    beforeAll(function(done) {
        vastParser = new VastParser();
        xmlLoader = new XmlFileLoader(url,done);
    });

    it("should be able to parse " + url, function(done) {
        vast = vastParser.parse(xmlLoader.getXmlDom());
        expect(vast).not.toBeNull();
        done();
    });
    it("should have a version element", function() {
        expect(vast.version).toEqual("3.0");
    });
    it("should have 2 Ad elements", function() {
        expect(vast.ads[0]).not.toBeNull();
        expect(vast.ads.length).toEqual(2);
    });
    //--VAST/Ad[0]
    describe("The first Ad", function(){
        it("should have an attribute id", function() {
            expect(vast.ads[0].id).toEqual("preroll-2");
        });
        it("should have an attribute sequence", function() {
            expect(vast.ads[0].sequence).toEqual("2");
        });
        it("should have an Inline element ", function() {
            expect(vast.ads[0].inLine).not.toBeNull();
        });
        //---VAST/Ad[0]/Inline
        describe("The Inline element", function(){
            it("should have an AdSystem element ", function() {
                expect(vast.ads[0].inLine.adSystem).not.toBeNull();
            });
            describe("The AdSystem element", function() {
                it("should have an attribute version ", function () {
                    expect(vast.ads[0].inLine.adSystem.version).toEqual("1.0");
                });
                it("should have a content", function () {
                    expect(vast.ads[0].inLine.adSystem.name).toEqual("cswebplayer ads server");
                });
            });
            it("should have an AdTitle element ", function() {
                expect(vast.ads[0].inLine.adTitle).toEqual("Unitary test ad");
            });
            it("should have a Description element ", function() {
                expect(vast.ads[0].inLine.description).toEqual("This ad is used to test VastParser.js");
            });
            it("should have an Advertiser element ", function() {
                expect(vast.ads[0].inLine.advertiser).toEqual("Viaccess-Orca");
            });
            it("should have a Pricing element ", function() {
                expect(vast.ads[0].inLine.pricing).not.toBeNull();
            });
            describe("The Pricing element", function() {
                it("should have an attribute model ", function () {
                    expect(vast.ads[0].inLine.pricing.model).toEqual("CPM");
                });
                it("should have an attribute currency ", function () {
                    expect(vast.ads[0].inLine.pricing.currency).toEqual("USD");
                });
                // TODO: how to get an integer?
                it("should have a content", function () {
                    pending("how to get an integer?");
                    expect(vast.ads[0].inLine.pricing.price).toEqual(50);
                });
            });
            it("should have a Survey element ", function() {
                expect(vast.ads[0].inLine.survey).toEqual("");
            });
            it("should have an Error element ", function() {
                expect(vast.ads[0].inLine.error).toEqual("http://qa.jwplayer.com/~alex/pixel.gif?err=[ERRORCODE]");
            });
            it("should have 1 Impression element ", function() {
                expect(vast.ads[0].inLine.impressions[0]).not.toBeNull();
                expect(vast.ads[0].inLine.impressions.length).toEqual(1);
            });
            describe("The Impression element", function() {
                it("should have an attribute id ", function () {
                    expect(vast.ads[0].inLine.impressions[0].id).toEqual("DART");
                });
                it("should have a content", function () {
                    expect(vast.ads[0].inLine.impressions[0].uri).toEqual("http://localhost/log?impression");
                });
            });
            it("should have 2 Creatives elements ", function() {
                expect(vast.ads[0].inLine.creatives).not.toBeNull();
                expect(vast.ads[0].inLine.creatives.length).toEqual(2);
            });
            //----VAST/Ad[0]/Inline/Creatives/Creative
            describe("The first Creatives element", function() {
                it("should have an attribute id ", function () {
                    expect(vast.ads[0].inLine.creatives[0].id).toEqual("cswebplayer ads server");
                });
                it("should have an attribute sequence ", function () {
                    expect(vast.ads[0].inLine.creatives[0].sequence).toEqual("1");
                });
                it("should have an attribute AdID ", function () {
                    expect(vast.ads[0].inLine.creatives[0].adId).toEqual("toto");
                });
                it("should have an attribute apiFramework ", function () {
                    expect(vast.ads[0].inLine.creatives[0].apiFramework).toEqual("api5.0");
                });
                it("should have a Linear element ", function () {
                    expect(vast.ads[0].inLine.creatives[0].linear).not.toBeNull();
                });
                //----VAST/Ad[0]/Inline/Creatives/Creative/Linear
                describe("The Linear element", function() {
                    it("should have an attribute skipoffset ", function () {
                        expect(vast.ads[0].inLine.creatives[0].linear.skipoffset).toEqual("00:00:03");
                    });
                    it("should have a Duration element ", function () {
                        expect(vast.ads[0].inLine.creatives[0].linear.duration).toEqual("00:00:10");
                    });
                    it("should have 16 TrackingEvents elements ", function () {
                        expect(vast.ads[0].inLine.creatives[0].linear.trackingEvents).not.toBeNull();
                        expect(vast.ads[0].inLine.creatives[0].linear.trackingEvents.length).toEqual(16);
                    });
                    //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/TrackingEvents
                    describe("The first TrackingEvents element", function() {
                        it("should have an event attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.trackingEvents[0].event).toEqual("creativeView");
                        });
                        it("should have an uri content ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.trackingEvents[0].uri).toEqual("http://localhost/log?creativeView");
                        });
                    });
                    it("should have a AdParameters element ", function () {
                        expect(vast.ads[0].inLine.creatives[0].linear.adParameters).not.toBeNull();
                    });
                    //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/AdParameters
                    describe("The AdParameters element", function() {
                        it("should have a xmlEncoded attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.adParameters.xmlEncoded).toEqual("false");
                        });
                        it("should have a metadata content ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.adParameters.metadata).toEqual("this is an AdParameter");
                        });
                    });

                    it("should have a VideoClicks element ", function () {
                        expect(vast.ads[0].inLine.creatives[0].linear.videoClicks).not.toBeNull();
                    });

                    //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/VideoClicks
                    describe("The VideoClicks element", function() {
                        it("should have a ClickThrough element ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.clickThrough).not.toBeNull();
                        });
                        //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/VideoClicks/ClickThrough
                        describe("The ClickThrough element", function() {
                            it("should have an id attribute ", function () {
                                expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.clickThrough.id).toEqual("click1");
                            });
                            it("should have a uri element ", function () {
                                expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.clickThrough.uri).toEqual("http://www.jwplayer.com/");
                            });
                        });
                        //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/VideoClicks/ClickTracking
                        describe("The ClickTracking element", function() {
                            it("should have an id attribute ", function () {
                                expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.clickTracking.id).toEqual("click2");
                            });
                            it("should have a uri element ", function () {
                                expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.clickTracking.uri).toEqual("http://qa.jwplayer.com/");
                            });
                        });
                        //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/VideoClicks/CustomClick
                        describe("The CustomClick element", function() {
                            it("should have an id attribute ", function () {
                                expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.customClick.id).toEqual("click3");
                            });
                            it("should have a uri element ", function () {
                                expect(vast.ads[0].inLine.creatives[0].linear.videoClicks.customClick.uri).toEqual("http://thisisadummuuri.com");
                            });
                        });
                    });

                    it("should have 2 MediaFiles elements ", function () {
                        expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles).not.toBeNull();
                        expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles.length).toEqual(2);
                    });

                    //----VAST/Ad[0]/Inline/Creatives/Creative/Linear/MediaFiles
                    describe("The first MediaFiles element", function() {
                        it("should have an id attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].id).toEqual("1");
                        });
                        it("should have a delivery attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].delivery).toEqual("progressive");
                        });
                        it("should have a type attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].type).toEqual("video/mp4");
                        });
                        it("should have a bitrate attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].bitrate).toEqual("0");
                        });
                        it("should have a width attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].width).toEqual("640");
                        });
                        it("should have a height attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].height).toEqual("360");
                        });
                        it("should have a scalable attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].scalable).toEqual("false");
                        });
                        it("should have a maintainAspectRatio attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].maintainAspectRatio).toEqual("false");
                        });
                        it("should have a codec attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].codec).toEqual("avc1");
                        });
                        it("should have an apiFramework attribute ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].apiFramework).toEqual("thisisanapiframework");
                        });
                        it("should have an uri element ", function () {
                            expect(vast.ads[0].inLine.creatives[0].linear.mediaFiles[0].uri).toEqual("http://content.jwplatform.com/videos/5jzLPZMW-kNspJqnJ.mp4");
                        });
                    });
                });
            });
        });
    });
});


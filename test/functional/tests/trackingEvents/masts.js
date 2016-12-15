//"ExpectedtrackingEvents":{"creativeView":0,"start":0,"firstQuartile":0,"midpoint":0,"thirdQuartile":0,"complete":0,"mute":0,"unmute":0,"pause":0,"rewind":0,"resume":0,"fullscreen":0,"exitFullscreen":0,"expand":0,"collapse":0,"acceptInvitationLinear":0,"closeLinear":0,"skip":0,"progress":0}
define({
    MAST_NONE: {
        "name": "no mast url",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"",
        "ExpectedtrackingEvents":{}
    },
    MAST_PREROLL_VAST2_LINEAR: {
        "name": "VAST2 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1}
    },
    MAST_PREROLL_VAST2_LINEAR_IMAGE: {
        "name": "VAST2 Linear preroll image",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-image.xml",
        "ExpectedtrackingEvents":{}
    },
    MAST_PREROLL_VAST3_LINEAR: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"rewind":'x'}
    },
    MAST_PREROLL_VAST3_LINEAR_PAUSE: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"pause":1,"resume":1,"progress":3,"rewind":'x'}
    },
    MAST_PREROLL_VAST3_LINEAR_MUTE: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"mute":1,"unmute":1,"progress":3,"rewind":'x'}
    },
    MAST_PREROLL_VAST3_LINEAR_CLOSE: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"closeLinear":1,"progress":'x', "firstQuartile":'x',"rewind":'x'}
    },
    MAST_PREROLL_VAST3_LINEAR_REWIND: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"rewind":4,"progress":3}
    },
    MAST_PREROLL_VAST3_LINEAR_FULLSCREEN: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"exitFullscreen":1,"fullscreen":1,"rewind":'x'}
    },
    MAST_PREROLL_VAST3_LINEAR_ACCEPTINVITATION: {
        "name": "VAST3 Linear preroll",
        "protocol": "MSS",
        "type": "Live",
        "url": "http://2is7server1.rd.francetelecom.com/C4/C4-51_BBB.isml/Manifest",
        "videoBitrates": [230000, 331000, 477000, 688000, 991000, 1427000, 2100000],
        "video_fragment_pattern":"(video)",
        "audio_fragment_pattern":"(audio)",
        "mastUrl":"http://cswebplayer.viaccess.fr/adsserver/xml/mast/preroll-vast30.xml",
        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"acceptInvitationLinear":1,"rewind":'x'}
    }
});

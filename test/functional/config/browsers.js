
define(function () {

    var CHROME_CONFIG_WINDOWS7  = { browserName: 'chrome', 				platform: 'WINDOWS',	os:'WINDOWS', 	os_version:'7'};
	var CHROME_CONFIG_LINUX    	= { browserName: 'chrome', 				platform: 'LINUX', 		os:'LINUX', 	os_version:'16.04' };
	var CHROME_CONFIG_WINDOW10  = { browserName: 'chrome', 				platform: 'WINDOWS', 	os:'WINDOWS', 	os_version:'10' };

	var IE11_CONFIG_WINDOWS7    = { browserName: 'internet explorer',  	platform: 'WINDOWS', 	os:'WINDOWS', 	os_version:'7', 	version:'11'};

    var EDGE_CONFIG_WINDOW10    = { browserName: 'MicrosoftEdge', 		platform: 'WINDOWS',	os:'WINDOWS', 	os_version:'10' };

	var FIREFOX_CONFIG_WINDOW10 = { browserName: 'firefox', 			platform: 'WINDOWS', 	os:'WINDOWS', 	os_version:'10' };
	var FIREFOX_CONFIG_WINDOWS7 = { browserName: 'firefox', 			platform: 'WINDOWS', 	os:'WINDOWS', 	os_version:'7', 	marionette: true };
	var FIREFOX_CONFIG_LINUX    = { browserName: 'firefox', 			platform: 'LINUX', 		os:'LINUX', 	os_version:'16.04', marionette: true };

    return {
		
		chrome_linux: [ CHROME_CONFIG_LINUX ],
		
		chrome_windows7: [ CHROME_CONFIG_WINDOWS7 ],

		ie11_windows7: [ IE11_CONFIG_WINDOWS7 ],

		edge_windows10: [ EDGE_CONFIG_WINDOW10 ],

		chrome_windows10: [ CHROME_CONFIG_WINDOW10 ],

		firefox_windows10: [ FIREFOX_CONFIG_WINDOW10 ],

		firefox_windows7: [ FIREFOX_CONFIG_WINDOWS7 ],
		
        firefox_linux: [ FIREFOX_CONFIG_LINUX ],

	};
});

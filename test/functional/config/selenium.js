define({

	local: {
		proxyOnly: false,
        proxyPort: 1024,
		tunnel: 'NullTunnel',
        tunnelOptions: {
            hostname: '127.0.0.1',
            port: '5561',
            verbose: false
        },

		excludeInstrumentation: true,

		reporters: [
			"Runner",
			{id: 'JUnit', filename: 'test/functional/test-reports/' + (new Date().getFullYear())+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate())+'_'+(new Date().getHours())+'-'+(new Date().getMinutes())+'-'+(new Date().getSeconds()) + '_report.xml'}
		],
        capabilities: {
			'selenium-version': '3.0.1',
			'marionette': true,
			'max-duration': 70,
			'command-timeout': 70,
		    'idle-timeout': 70,
			'ensureCleanSession' : true,
			'ie.ensureCleanSession' : true,
			'InternetExplorerDriver.IE_ENSURE_CLEAN_SESSION' : true
        },
        leaveRemoteOpen:'fail'
    }
});

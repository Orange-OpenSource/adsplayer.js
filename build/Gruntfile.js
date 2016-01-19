module.exports = function(grunt) {

	grunt.initConfig({

		revision: {
			options: {
				property: 'meta.revision',
				ref: 'HEAD',
				short: true
			}
		},

		jshint: {
			all: ["../src/**/*.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		uglify: {
			min: {
				options: {
					beautify : false,
					mangle: false,
					banner: '@@COPYRIGHTTOREPLACE/* Last build : @@TIMESTAMPTOREPLACE / git revision : @@REVISIONTOREPLACE */\n'
				},
				files: {
					'../dist/adsplayer.min.js': [
					'../src/adsplayer.js', 
					'../src/MAST/mast-client.js',
					'../src/MAST/MastLoader.js',
					'../src/MAST/MastParser.js',
					'../src/VAST/vast-client.js'
					]
				}
			},
			debug: {
				options: {
					beautify : true,
					mangle: false,
					banner: '@@COPYRIGHTTOREPLACE/* Last build : @@TIMESTAMPTOREPLACE / git revision : @@REVISIONTOREPLACE */\n'
				},
				files: {
					'../dist/adsplayer.js': [
						'../src/adsplayer.js', 
						'../src/MAST/mast-client.js',
						'../src/MAST/MastLoader.js',
						'../src/MAST/MastParser.js',
						'../src/VAST/vast-client.js'
					]
				}
			}
		},

		replace: {
			all: {
				options: {
					patterns: [
						{
							match: 'REVISIONTOREPLACE',
							replacement: '<%= meta.revision %>'
						},
						{
							match: 'TIMESTAMPTOREPLACE',
							replacement: '<%= (new Date().getDate())+"."+(new Date().getMonth()+1)+"."+(new Date().getFullYear())+"_"+(new Date().getHours())+":"+(new Date().getMinutes())+":"+(new Date().getSeconds()) %>'
						},
						{
							match: 'COPYRIGHTTOREPLACE',
							replacement: '<%= grunt.file.read("../LICENSE") %>\n\n'
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['../dist/adsplayer.min.js', '../dist/adsplayer.js'], dest: '../dist'}
				]
			}
		},

		copy: {
			local: {
				files: [
					{
						expand: true,
						src: ['../dist/adsplayer.js'],
						dest: '../../hasplayer.js/dist/',
						flatten: true
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-git-revision');
	grunt.loadNpmTasks('grunt-replace');

	grunt.registerTask('build', [
		'jshint',      
		'revision',    // Get git info
		'uglify',      // Minify the concated file
		'replace',     // Add the git info in files
	]);

	grunt.registerTask('local', [
		'copy:local'
	]);

	grunt.registerTask('default', ['build']);
};
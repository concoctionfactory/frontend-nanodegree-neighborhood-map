module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	var config = grunt.file.readYAML('Gruntconfig.yml');

	grunt.initConfig({
		concat:{
			dist:{
				src: config.jsSrcDir+'*.js',
				dest: config.jsConcatDir+'app.js'
			}
		},

		jshint:{
			all:[
				'Gruntfile.js',
				config.jsSrcDir+"*.js"
			]
		},

		htmlmin:{
			dist:{
				options:{
					removeComments: true,
					collaspeWhitespace: true
				},
				files: {
					'dist/index.html' : 'src/index.html',
				}
			}
		},


		cssmin:{
			target:{
				files:[{
					expand:true,
					cwd:'src/css',
					src:['*.css'],
					dest:'dist/css'
				}]
			}
		}

	});




	grunt.registerTask('default', [
		'jshint',
		'concat',
		'htmlmin',
		//'cssmin'
	]);

};
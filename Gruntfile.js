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
		},



	copy:{
		image:{
			expand: true,
			cwd:'src/images',
			src:'**',
			dest:'dist/images'
		},
		lib:{
			expand:true,
			cwd:'src/js/lib',
			src:'**',
			dest:'dist/js/lib'
		},
		css:{
			expand:true,
			cwd:'src/css',
			src:'**',
			dest:'dest/css'
		}
	},


	uglify: {
		options: {
			compress: {
				drop_console: true
			}
		},
		my_target: {
			files: {
				'dist/js/app.js': ['src/js/app.js']
			}
		}
	},

	});

	grunt.registerTask('default', [
		'jshint',
		'concat',
		'htmlmin',
		'cssmin',
		'copy'
	]);

	grunt.registerTask('lib', [
		'copy:lib',
	]);

	grunt.registerTask('html',[
		'htmlmin'
	]);

	grunt.registerTask('js',[
		'jshint',
		'uglify'
	]);

};
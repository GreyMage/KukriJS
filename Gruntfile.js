var fullRun = [
  'jshint',
  'concat',
  'jasmine',
  'uglify'
];

module.exports = function(grunt) {

  var c = {};
  if(grunt.file.exists('config.json')){
    c = grunt.file.readJSON('config.json');
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '\n\n',
      },
      dist: {
        src: ['src/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> - <%= pkg.description %> By <%= pkg.author %> ( <%= pkg.homepage %> ), Built on <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        sourceMap:true,
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      // define the files to lint
      files: ['Gruntfile.js', 'src/**/*.js', '<%= jasmine.options.specs %>'],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        // more options here if you want to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },
    jasmine: {
      src: '<%= concat.dist.dest %>',
      options: {
        specs: 'spec/**/*.js',
        '--web-security': false
      }
    },
    watch: {
		most:{
			files: ['<%= jshint.files %>', 'src/views/**', 'src/public/**'],
			tasks: fullRun,
		},
		options: { 
			livereload: 9000,
			debounceDelay: 1000,
		},
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', fullRun );
  grunt.registerTask('default', "Basic",function(){
	var extended = fullRun.slice();
	extended.push("watch");
	grunt.task.run(extended);
  });

};

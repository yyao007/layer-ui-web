/*eslint-disable */

var fs = require('fs');
var path = require('path');
var version = require('./package.json').version;
var websdkVersion = require('layer-websdk/package.json').version;
var HTML_HEAD = fs.readFileSync('./jsduck-config/head.html').toString();
var CSS = fs.readFileSync('./jsduck-config/style.css').toString();
var babel = require('babel-core');


module.exports = function (grunt) {

  var saucelabsTests = require('./sauce-gruntfile')(grunt, version);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      options: {
        separator: ';',
        transform: [ ],
        browserifyOptions: {
          standalone: 'layerUI'
        }
      },
      cardtest: {
        files: [
          {
            dest: 'build/layer-ui-web-cards-test.js',
            src: 'card-test.js'
          }
        ],
        options: {
          transform: [['babelify', {
            presets: ['es2015']}]],
        }
      },
      build: {
        files: [
          {
            dest: 'build/layer-ui-web.js',
            src: 'lib-es5/index.js'
          }
        ]
      },
      debug: {
        files: [
          {
            dest: 'test/layer-ui-web-test.js',
            src: 'lib-es5/index.js'
          }
        ],
        options: {}
      },
      'debug-es6': {
        files: [
          {
            dest: 'test/layer-ui-web-test-es6.js',
            src: 'lib-es6/index.js'
          }
        ],
        options: {
          transform: [['babelify', {
            presets: ['es2015']}]],
        }
      },
      coverage: {
        files: {
          'test/layer-ui-web-test.js': ['lib-es5/index.js']
        },
        options: {
          transform: [[fixBrowserifyForIstanbul], ["istanbulify"]],
          browserifyOptions: {
            standalone: false,
            debug: false
          }
        }
      }
    },

    webcomponents: {
      debug: {
        files: [
          {
            src: ['src/**/*.js', '!src/**/test.js', '!src/**/tests/*.js']
          }
        ],
        options: {
        }
      }
    },
    less: {
      themes: {
        files: [
          {src: ['themes/src/bubbles-basic/theme.less'], dest: 'themes/build/bubbles-basic.css'},
          {src: ['themes/src/groups-basic/theme.less'], dest: 'themes/build/groups-basic.css'}
        ]
      }
    },
    cssmin: {
      build: {
        files: [
          {src: ['themes/build/bubbles-basic.css'], dest: 'themes/build/bubbles-basic.min.css'},
          {src: ['themes/build/groups-basic.css'], dest: 'themes/build/groups-basic.min.css'}
        ]
      }
    },
    /* TODO: This is a crap copy routine as multiple themes using the same template name will overwrite eachother. */
    copy: {
      themes: {
        src: ["themes/src/*/**.html", "themes/src/*/**.js"],
        dest: "themes/build/",
        flatten: true,
        expand: true
      }
    },
    uglify: {
    	options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
    				'<%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: false,
        screwIE8: true
      },
      build: {
        files: {
          'build/layer-ui-web.min.js': ['build/layer-ui-web.js']
        }
      }
    },

    // Documentation
    jsduck: {
      build: {
        src: ["lib-es5/**/*.js", "node_modules/layer-websdk/lib/**/*.js"],
        dest: 'docs',
        options: {
          'builtin-classes': false,
          'warnings': ['-no_doc', '-dup_member', '-link_ambiguous', '-cat_class_missing'],
          'external': ['HTMLTemplateElement', 'Websocket', 'Blob', 'KeyboardEvent', 'DocumentFragment', 'IDBVersionChangeEvent', 'IDBKeyRange', 'IDBDatabase'],
          'title': 'Layer UI for Web - API Documentation',
          'categories': ['jsduck-config/categories.json'],
          'head-html': HTML_HEAD,
          'css': [CSS],
          'footer': 'Layer WebSDK v' + websdkVersion + '; Layer UI for Web v' + version
        }
      }
    },
    jsducktemplates: {
      build: {
        files: [
          {
            src: ['src/components/**/*.html']
          }
        ],
        options: {
        }
      }
    },
    jsduckfixes: {
      build: {
        files: [
          {
            src: ['docs/output/*.js']
          }
        ],
        options: {
        }
      }
    },


    watch: {
      debug: {
        files: ['index.js', 'src/**', 'Gruntfile.js', '!**/test.js', '!src/**/tests/**.js'],
        tasks: ['cardtest', 'debug', 'make-npm-link-safe', 'notify:watch'],
        options: {
          interrupt: true
        }
      },
      themes: {
        files: ['themes/src/**'],
        tasks: ['theme', 'make-npm-link-safe'],
        options: {
          interrupt: true
        }
      }
    },
    notify: {
      watch: {
        options: {
          title: 'Watch Build LUI',  // optional
          message: 'LUI Complete', //required
        }
      }
    },
    connect: {
      saucelabs: {
        options: {
          base: "",
          port: 9999
        }
      },
      develop: {
        options: {
          base: "",
          port: 8004
        }
      }
    },
    'generate-tests': {
      debug: {
        files: [
          {
            src: ['src/**/test.js', 'src/**/tests/**.js']
          }
        ],
      }
    },
    'saucelabs-jasmine': saucelabsTests.tasks.saucelabs,
  });

  /* npm link causes a second layer-websdk to get built via browserify/webpack.
   * Removing layer-ui-web/node_modules/layer-websdk while using npm link causes errors to be thrown indicating
   * that "layer-websdk" cannot be found (even through its in ~/node_modules/layer-websdk).
   * So now we have to copy a proper looking npm repo, and make sure that all dependencies are present.
   */
  grunt.registerTask('make-npm-link-safe', "Making NPM Link Safe", function() {
    if (grunt.file.exists('npm-link-projects.json')) {
      var projectFolders = require('./npm-link-projects.json');
      projectFolders.forEach(function(project) {
        grunt.file.copy('package.json', project + '/node_modules/layer-ui-web/package.json');
        grunt.file.copy('lib-es5', project + '/node_modules/layer-ui-web/lib-es5');
        grunt.file.copy('themes', project + '/node_modules/layer-ui-web/themes');
      });
    }
  });


  /* There is some path of using expose and external that should allow us to do a require('layer-websdk')
     without it being in this build, but I do not see it.  So, brute force:
     1. Before browserify, we replace layer-websdk/index.js with `module.exports = global.layer`,
     2. after browserify, we restore index.js
  */
  grunt.registerTask('before-browserify', 'Swap layer-websdk for global', function() {
    var newcode = 'module.exports = global.layer;';
    var contents = grunt.file.read('node_modules/layer-websdk/index.js');
    if (contents != newcode) {
      grunt.file.write('node_modules/layer-websdk/index-stashed.js', contents);
    }
    grunt.file.write('node_modules/layer-websdk/index.js', newcode);
  });

  grunt.registerTask('after-browserify', 'Swap layer-websdk back', function() {
    grunt.file.copy('node_modules/layer-websdk/index-stashed.js', 'node_modules/layer-websdk/index.js');
  });


  grunt.registerTask('wait', 'Waiting for files to appear', function() {
    console.log('Waiting...');
    var done = this.async();

    // There is an inexplicable delay between when grunt writes a file (and confirms it as written) and when it shows up in the file system.
    // This has no affect on subsequent grunt tasks but can severely impact npm publish
    // Note that we can't test if a file exists because grunt reports that it exists even if it hasn't yet been flushed to the file system.
    setTimeout(function() {
      console.log("Waiting...");
      setTimeout(function() {
        console.log("Waiting...");
        setTimeout(function() {
          done();
        }, 1500);
      }, 1500);
    }, 1500);
  });

  grunt.registerMultiTask('webcomponents', 'Building Web Components', function() {
    var options = this.options();

    function createCombinedComponentFile(file, outputPathES5, outputPathES6) {
      try {
      // Extract the class name; TODO: class name should be same as file name.
      var jsFileName = file.replace(/^.*\//, '');
      var className = jsFileName.replace(/\.js$/, '');

      if (jsFileName === 'test.js') return;

      var output = grunt.file.read(file);

      var templateCount = 0;
      var outputFolderES6 = path.dirname(outputPathES6);
      var outputFolderES5 = path.dirname(outputPathES5);

      // Find the template file by checking for an html file of the same name as the js file in the same folder.
      var parentFolder = path.dirname(file);
      var pathToBase = parentFolder.replace(/[/|\bsrc][^/]*/g, "/..").substring(4) + "/base"

      var templates = grunt.file.expand(parentFolder + "/*.html")
      templates.forEach(function(templateFileName) {
      // Stick the entire template into a function comment for easy multi-line string,
      // and feed the resulting function.toString() into buildTemplate() to create and assign a template to the widget.
      // TODO: maybe we should minify the HTML and CSS so it fits on a single line and doesn't need a function comment.
      //       Note: this would require escaping of all strings, which can get messy.
        grunt.log.writeln("Writing template for " + className);
        var contents = grunt.file.read(templateFileName);
        contents = contents.replace(/\/\*[\s\S]*?\*\//mg, '');

        var templates = contents.match(/^\s*<template(\s+id=['"].*?['"]\s*)?>([\s\S]*?)<\/template>/mg);
        templates.forEach(function(templateString) {
          templateCount++;
          var templateMatches = templateString.match(/^\s*<template(\s+id=['"].*?['"]\s*)?>([\s\S]*?)<\/template>/m);
          var templateContents = templateMatches[2];
          var templateId = templateMatches[1] || '';
          if (templateId) templateId = templateId.replace(/^.*['"](.*)['"].*$/, "$1");
          if (!templateId) {
            var templateName = templateFileName.replace(/\.html/, '').replace(/^.*\//, '');
            if (templateName !== className) templateId = templateName;
          }

          // Extracting styles won't be needed once we have shadow dom.  For now, this prevents 500 <layer-message> css blocks
          // from getting added and all applying to all messages.
          var styleMatches = templateContents.match(/<style>([\s\S]*)<\/style>/);
          var style;
          if (styleMatches) {
            style = styleMatches[1].replace(/^\s*/gm, '');
            templateContents = templateContents.replace(/<style>([\s\S]*)<\/style>\s*/, '');
          }

          // Strip out white space between tags
          templateContents = templateContents.replace(/>\s+</g, '><');

          // Generate the <template /> and <style> objects
          output += '\n(function() {\n';
          output += 'var layerUI = require(\'' + pathToBase + '\');\n';
          output += 'layerUI.buildAndRegisterTemplate("' + className + '", ' + JSON.stringify(templateContents.replace(/\n/g,'').trim()) + ', "' + templateId + '");\n';
          output += 'layerUI.buildStyle("' + className + '", ' + JSON.stringify(style.trim()) + ', "' + templateId + '");\n';
          output += '})()';
        });
      });

      //var outputES5 = output.replace(/\/\*[\s\S]*?\*\//g, '');
      var outputES5 = output;
      //var outputES6 = output.replace(/import\s+Layer\s+from\s+'layer-websdk'\s*;/g, 'import Layer from \'layer-websdk/index-es6\'');
      var outputES6 = output.replace(/import\s+(Layer, {.*?}|Layer|{.*?})\s+from\s+'layer-websdk'\s*;/g, 'import $1 from \'layer-websdk/index-es6\'');

      if (!grunt.file.exists(outputFolderES6)) {
        grunt.file.mkdir(outputFolderES6);
      }
      grunt.file.write(outputPathES6, outputES6);

      if (!grunt.file.exists(outputFolderES5)) {
        grunt.file.mkdir(outputFolderES5);
      }
      var babelResult = babel.transform(outputES5, {
        presets: ['babel-preset-es2015']
      });
      outputES5 = babelResult.code;

      // Babel sometimes moves our jsduck comments defining the class to the end of the file, causing JSDuck to quack.
      // Move it back to the top so that JSDuck knows what class all the properties and methods belong to.
      var indexOfClass = outputES5.indexOf('@class');
      if (indexOfClass !== -1) var indexOfClassCodeBlock = outputES5.lastIndexOf('/**', indexOfClass);
      if (indexOfClassCodeBlock !== -1) {
        var endOfClassCodeBlock = outputES5.indexOf('*/', indexOfClass);
        if (endOfClassCodeBlock !== -1) {
          endOfClassCodeBlock += 2;
          var prefix = outputES5.substring(0, indexOfClassCodeBlock);
          var classComment = outputES5.substring(indexOfClassCodeBlock, endOfClassCodeBlock);
          classComment = classComment.replace(/\n\s*\*/g, '\n *') + '\n';
          var postfix =  outputES5.substring(endOfClassCodeBlock);
          outputES5 = classComment + prefix + postfix;
        }
      }

      grunt.file.write(outputPathES5, outputES5);
      //grunt.log.writeln("Wrote " + outputPath + "; success: " + grunt.file.exists(outputPath));
      } catch(e) {
        grunt.log.writeln('Failed to process ' + file + '; ', e);
      }
    }

    grunt.file.delete('lib-es5');
    grunt.file.delete('lib-es6');

    var files = [];
    // Iterate over each file set and generate the build file specified for that set
    this.files.forEach(function(fileGroup) {
      fileGroup.src.forEach(function(file, index) {
        files.push(file);
        var outputPathES5 = file.replace(/^src/, 'lib-es5');
        var outputPathES6 = file.replace(/^src/, 'lib-es6');
        createCombinedComponentFile(file, outputPathES5, outputPathES6);
      });
    });
  });

  grunt.registerTask('version', 'Assign Versions', function() {
    var contents = grunt.file.read('src/base.js');
    var newContents = contents.replace(/layerUI\.version = (.*)$/m, "layerUI.version = '" + version + "';");
    if (newContents != contents) grunt.file.write('src/base.js', newContents);
  });

    /* Insure that browserify and babelify generated code does not get counted against our test coverage */
  var through = require('through');
  function fixBrowserifyForIstanbul(file) {
    var generatedLines = [
      "function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }",
    ];
      var data = '';
      return through(write, end);

      function write (buf) {
          data += buf;
      }
      function end () {
        var lines = data.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
          if (generatedLines.indexOf(lines[i]) !== -1) {
            lines[i] = "/* istanbul ignore next */ " + lines[i];
          }
        }

        this.queue(lines.join('\n'));
        this.queue(null);
      }
    }

    grunt.registerMultiTask('generate-tests', 'Building SpecRunner.html', function() {
      var options = this.options();
      var specFile = grunt.file.read('test/SpecRunner.html');
      var startStr = "<!-- START GENERATED SPEC LIST -->";
      var endStr = "<!-- END GENERATED SPEC LIST -->";
      var startIndex = specFile.indexOf(startStr) + startStr.length;
      var endIndex = specFile.indexOf(endStr);

      var scripts = [];
      // Iterate over each file set and generate the build file specified for that set
      this.files.forEach(function(fileGroup) {
        fileGroup.src.forEach(function(file, index) {
          scripts.push('<script src="../' + file + '" type="text/javascript"></script>');
        });
      });

      specFile = specFile.substring(0, startIndex) + '\n' + scripts.join('\n') + '\n' + specFile.substring(endIndex);
      grunt.file.write('test/SpecRunner.html', specFile);
    });

    grunt.registerMultiTask('jsduckfixes', 'Fixing Docs', function() {
      var options = this.options();

      this.files.forEach(function(fileGroup) {
        fileGroup.src.forEach(function(file, index) {
            var contents = grunt.file.read(file);
            var startIndex = contents.indexOf('{');
            var endIndex = contents.lastIndexOf('}') + 1;
            var parsedContents = JSON.parse(contents.substring(startIndex, endIndex));

            if (parsedContents.members) parsedContents.members.forEach(function(element) {
              element.id = element.id.replace(/:/g, '_');
            });
            parsedContents.html = parsedContents.html.replace(/id='([^']*):([^']*)'/g, "id='" + "$1" + "_" + "$2'");
            parsedContents.html = parsedContents.html.replace(/href='([^']*):([^']*)'/g, "href='" + "$1" + "_" + "$2'");
            contents = contents.substring(0, startIndex) + JSON.stringify(parsedContents) + contents.substring(endIndex);
            grunt.file.write(file, contents);
        });
      });
    });

    /* Adds template info to the jsduck class definition comments */
    grunt.registerMultiTask('jsducktemplates', 'Adding templates to Docs', function() {
      var options = this.options();

      this.files.forEach(function(fileGroup) {
        fileGroup.src.forEach(function(file, index) {
          var template = grunt.file.read(file);
          var srcFilePath = file.replace(/src/, 'lib-es5').replace(/\.html/, '.js');
          var srcFile = grunt.file.read(srcFilePath);
          var startIndex = srcFile.indexOf("@class");
          console.log(srcFilePath + "  " + startIndex);

          if (startIndex !== -1) {
            var layerIds = (template.match(/layer-id=["'](.*?)["']/gm) || []).map(function(match) {
              return match.replace(/^.*["'](.*)["']/, "$1");
            });

            srcFile = srcFile.substring(0, startIndex) +
            `### Templates\n\n * You can see the template for the latest template version at [${file.replace(/^.*\//, '')}](https://github.com/layerhq/layer-ui-web/blob/master/src/${srcFilePath.replace(/^.*lib-es5/,'').replace(/\.js$/, '.html')})  \n * \n * The following layer-id attributes are expected in templates for this component: \n * \n * * ${layerIds.join('\n * * ')} \n` + srcFile.substring(startIndex);
            grunt.file.write(srcFilePath, srcFile);
          }
        });
      });
  });

  // Building
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-jsduck');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('coverage', ['webcomponents', 'browserify:coverage', "generate-tests"]);
  grunt.registerTask('theme', ['less', 'copy']),

  grunt.registerTask('cardtest', ['version', 'webcomponents', 'browserify:cardtest']);

  grunt.registerTask('docs', ['debug', 'jsducktemplates', 'jsduck', 'jsduckfixes']);
  grunt.registerTask('debug', ['version', 'webcomponents', 'browserify:debug', "generate-tests", 'before-browserify', 'browserify:build', 'after-browserify']);
  grunt.registerTask('build', ['version', 'webcomponents', 'before-browserify', 'browserify:build', 'after-browserify', 'uglify', 'theme', 'cssmin']);

  grunt.registerTask('default', ['build', 'docs']);
  grunt.registerTask('prepublish', ['build', 'theme', 'wait']);

  // NOTE: use testem rather than grunt test for quick testing on your desktop; this is for saucelabs cross-browser testing.
  grunt.registerTask("test", ["generate-tests", "connect:saucelabs", "saucelabs-jasmine"]);
  grunt.registerTask("develop", ["connect:develop", "watch"]);
};


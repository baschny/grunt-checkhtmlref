/*
 * grunt-checkhtmlref
 * https://github.com/lazarrs/grunt-checkhtmlref
 *
 * Copyright (c) 2013 Remus Lazar
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('checkhtmlref', 'Check your html files for broken internal references to other resources', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      expression: /href=['"]([^ "'<>]+)/g,
      htmlLinkExp: /(\.html$)|(.\/$)/, // link to html documents
      externalLinkExp: /^[a-z]+:\/\/.+$/ // external links
    });

    var files = [];
    var urls = [];

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(
        function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(f.cwd + '/' + filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        }).map(
          function(filepath) {
            // Read file source.
            var content = grunt.file.read(f.cwd + '/' +filepath);

            var result = [];
            var match = options.expression.exec(content);
            while(match != null) {
              var link = match[1];
              if (options.htmlLinkExp.exec(link) && !options.externalLinkExp.exec(link)) {
                result.push(link);
              }
              match = options.expression.exec(content);
            }

            var res = { file: filepath, links: result}; // Return array of link.
            files.push(res);
            urls.push(filepath);
            return res;
          });

      var dest = f.dest;
      var errors = [];

      files.forEach(function(f) {
        var error = false;
        var file = f.file;
        f.links.forEach(function(link) {
          if (link.match(/\/$/)) { link += 'index.html'; }

          if (link.match(/^\//)) {
            // absolute link
            link = link.substr(1);
          } else {
            // relative link, add the relative file path
            var path = file.substr(0,file.lastIndexOf('/')+1);
            link = path + link;
          }

          if (urls.indexOf(link) === -1) {
            error = true;
            grunt.log.warn("broken link: %s in file %s",
                           link,
                           file
                          );
            errors.push(link+":"+file)
          }
        });
      });
      if (dest) {
        grunt.file.write(dest,errors.join("\n"));
      }
    });
  });
};

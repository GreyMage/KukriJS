# KukriJS
(I'm lazy so this is short and sweet.)
### Install
`npm install --save-dev https://github.com/GreyMage/KukriJS.git`

I don't know how (or care to) setup a npm package, and this keep it all in line with my repo, so whatevs.

### Intended Usage
Kukri was made to be included _inside_ of build scripts at the point of concatenation, adding in libraries and common features. The idea is, if after the concatenation step the file is shrinkwrapped and uglified, then any features of Kukri you did _not_ use will be torn out by the uglifier. Therefore you can include the entire Kukri library for any project and the minified code would only contain what you use.

### Example for Grunt
```
concat: {
  options: {
    separator: '\n\n',
    banner:";(function( window, undefined ){\n'use strict';\n\n",
    footer:"\n\n}(window));",
  },
  dist: {
    src: [ require("KukriJS").js, 'src/*.js'],
    dest: 'dist/<%= pkg.name %>.js'
  }
}
```
Just add in Kukri before any other scripts you intend to concatenate and shrinkwrap and all the functions will be available to your source.

And, assuming you uglify the output again, unused bits will be removed. Magic!

### Final Thoughts
This was designed to be for my personal projects and I decided to put it here for others to use. Feel free to leave an issue or feature but I may very well ignore it.

I'm not going to bother keeping an updated function list right now, they are available in [https://github.com/GreyMage/KukriJS/blob/master/dist/KukriJS.js](https://github.com/GreyMage/KukriJS/blob/master/dist/KukriJS.js), and they are changing so much right now that its not worth the effort.

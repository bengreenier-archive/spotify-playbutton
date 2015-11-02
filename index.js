var req = require('request'),
	debug = require('debug')("spotify-playbutton"),
	Wm = require('window-mock'),
	Promise =  require('promise'),
	shimmer = require('shimmer'),
	domino = require('domino'),
	$ = require('jquery')(domino.createWindow()),
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest,
	ModifiedOriginGenerator = function() {
		var r = new XMLHttpRequest();
		r.setHeader("Origin","https://embed.spotify.com");
		return r;
	};

// TODO: I presume this can/will fuck with the client application.
// IF/WHEN we pull out TLS stuff cause we should do that,
// we should remember to pull this out too
$.support.cors = true;
$.ajaxSettings.xhr = ModifiedOriginGenerator;

/**
 * Export a Promise that resolves to a SpotifyRemote
 * 
 * @param object opts {SSL:boolean}
 */
module.exports = function (opts) {
	opts = opts || {SSL: true};
	
	return new Promise(function (resolve, reject) {
		req("http://open.spotify.com/token", function (err, res, body) {
			if (err || res.statusCode !== 200) {
				return reject(err || res.statusCode);
			}
			var t = JSON.parse(body).t;
			debug("got a token "+t);
			
			// this is spotifys entire client file. we're going to strip out what we need and eval it
			// because, clearly we're insane. 
			req("https://d2b1xqaw2ss8na.cloudfront.net/static/js/md.js", function (err, res, body) {
				if (err || res.statusCode !== 200) {
					return reject(err || res.statusCode);
				}
				
				debug("got the library");
				
				// this is how we identify where SpotifyRemote starts and ends. if the lib updates we just change these search terms
				// TODO: find a better (less scary feeling) solution
				var startIndex = body.indexOf('"SpotifyRemote"in window');
				var endIndex = body.indexOf('HTTP_SPOTIFY_OPEN_BASE="http://open.spotify.com";') + 'HTTP_SPOTIFY_OPEN_BASE="http://open.spotify.com";'.length;
				
				var remote = body.substr(startIndex, endIndex-startIndex);
				var window = new Wm();
				
				// if you wanna use ssl we set some things up (you should probably use it, too)
				if (opts.SSL) {
					debug("using SSL");
					window.location.protocol = "https:";
					
					//TODO: maybe we should run in a child_process so this doesn't fuck with
					// all TLS in the client application. this module is already hella sketchy
					// though, so leaving this here for now
					process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
				} else {
					window.location.protocol = "http:";
				}
				
				var SpotifyRemote = {};
				
				// TODO: kill everyone ever.
				debug("about to EVAL (yeah, be fucking scared)");
				eval(remote);
				debug("EVAL-ed");
				
				shimmer.wrap(SpotifyRemote, "createCookie", function (o) {
					return function () {
						debug("oh fuck. the spotify library tried to make a cookie",arguments);
						return o.apply(this,arguments);
					};
				});
				
				shimmer.wrap(SpotifyRemote.desktop.utils, "ajax", function (original) {
					return function () {
						var old = arguments[0].url;
						arguments[0].url = window.location.protocol + arguments[0].url;
						debug("modifying url from "+old+" to "+arguments[0].url);
						
						shimmer.wrap(arguments[0], "success", function (original) {
							return function () {
								debug("ajax ok");
								
								return original.apply(this, arguments);	
							};
						});
						
						shimmer.wrap(arguments[0], "error", function (original) {
							return function () {
								debug("ajax failed", arguments);
								
								return original.apply(this, arguments);	
							};
						});
						
						return $.ajax(arguments[0]);
					};
				});
				
				// TODO: figure out if we're actually resolved when we call init, or if we need to wait more
				resolve(SpotifyRemote.init(t, void 0, function cb(){}, {shouldUseWebPlayer: false}));
			});
			
		});
	});
};
// since this library is one big hack
// why not hack together the changes
// that need to be made to XMLHttpRequest
// for it to let us set origin?
// TODO: pull this out, fork XMLHttpRequest
// and put the changes there

var fs = require('fs');

(function() {
var bits = fs.readFileSync("node_modules/xmlhttprequest/lib/XMLHttpRequest.js").toString();

if (bits.indexOf("Set the value of any header") !== -1) {
	return console.log("no need to rewrite any deps.");
}

var frm = fs.readFileSync(__dirname + "/custom-version.txt").toString();

// var injectOne = bits.indexOf("/**\n   * Public methods\n   */");

// bits = bits.substr(0, bits.length-injectOne-1);
// bits += 'var customHeaders = {};\n\n';
// bits += '/**\n';
// bits += '  * Set the value of any header (before making the request).\n';
// bits += '  * \n';
// bits += '  * @param string header the header to set\n';
// bits += '  * @param string value the new header value\n';
// bits += '  */\n';
// bits += ' this.setHeader = function (header, value) {\n';
// bits += '   if (typeof(header) !== "string") {\n';
// bits += '     throw new Error("TypeError: header should be a string");\n';
// bits += '   }\n';
// bits += '   if (typeof(value) !== "string") {\n';
// bits += '     throw new Error("TypeError: value should be a string");\n';
// bits += '   }\n';
// bits += '\n';    
// bits += '   customHeaders[header] = value;\n';
// bits += '  };\n';
// bits += bits.substr(injectOne);

// var injectTwo = bits.indexOf("var options = {");

// bits = bits.substr(0, bits.length-injectTwo-1);
// bits += "// Set the custom headers, if any\n";
// bits += "for (var name in customHeaders) {\n";
// bits += "  headers[name] = customHeaders[name];\n";
// bits += "}\n";
// bits += bits.substr(injectTwo);

fs.writeFileSync("node_modules/xmlhttprequest/lib/XMLHttpRequest.js", frm);
console.log("rewrote node_modules/xmlhttprequest/lib/XMLHttpRequest.js with startup/custom-version.txt");

})();
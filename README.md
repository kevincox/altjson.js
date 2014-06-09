# AltJSON.js

[![Build Status](https://travis-ci.org/kevincox/altjson.js.png?branch=master)](https://travis-ci.org/kevincox/altjson.js)

[![Browser Support](https://ci.testling.com/kevincox/altjson.js.png)](https://ci.testling.com/kevincox/altjson.js)

Javascript implementation of AltJSON encoding.  AltJSON is an alternative
encoding for JSON designed to be more efficient while maintaining the same data
model.  Use JSON as your regular interface but speed it up when available using
AltJSON.

More information about AltJSON is available
[here](https://github.com/kevincox/altjson.rb).

## Usage

AltJSON.js works in node and in the browser.  However it requires the Encoding
API which is not implemented in all environments.  In node the polyfill will
be installed as a dependency but for browsers such as chrome
[a polyfill](https://github.com/inexorabletash/text-encoding) can be used.

```js
require(["altjson"], function(AltJSON) {
	// Load via AMD.
});
// OR
var AltJSON = require("altjson"); // In node.
// OR
AltJSON; // When just included in a webpage.

AltJSON.encode([1,2,3]) //=> Uint8Array([0xC3,1,2,3])
AltJSON.decode(new Uint8Array([0x81])) //=> true
```

AltJSON is on npm.

```sh
npm install altjson
```

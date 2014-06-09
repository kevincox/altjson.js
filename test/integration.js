// Copyright 2014 Kevin Cox

/*******************************************************************************
*                                                                              *
*  This software is provided 'as-is', without any express or implied           *
*  warranty. In no event will the authors be held liable for any damages       *
*  arising from the use of this software.                                      *
*                                                                              *
*  Permission is granted to anyone to use this software for any purpose,       *
*  including commercial applications, and to alter it and redistribute it      *
*  freely, subject to the following restrictions:                              *
*                                                                              *
*  1. The origin of this software must not be misrepresented; you must not     *
*     claim that you wrote the original software. If you use this software in  *
*     a product, an acknowledgment in the product documentation would be       *
*     appreciated but is not required.                                         *
*                                                                              *
*  2. Altered source versions must be plainly marked as such, and must not be  *
*     misrepresented as being the original software.                           *
*                                                                              *
*  3. This notice may not be removed or altered from any source distribution.  *
*                                                                              *
*******************************************************************************/

var chai = require("chai");
chai.config.includeStack = true;
var expect = chai.expect;

var aj = require("../altjson.js");
var bb = function(){ return new Uint8Array(arguments) }

function assert_roundtrip(d) {
	expect(aj.decode(aj.encode(d))).to.eql(d);
}

describe(".roundtrips()", function()
{
	it("should", function(){
		assert_roundtrip({
			e: 0,
			msg: 'This is a message about your request.',
			items: [
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
				0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,
			],
			weird: [{a: 'b', c: 5}, {f: 4}],
			longfloat: 41414.24251245215412,
			superlongfloat: 4195921845895147686785.46151614563461515614615,
		});
	});
});

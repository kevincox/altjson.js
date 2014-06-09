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

describe(".decode()", function()
{
	it("should decode false", function(){
		expect(aj.decode(bb(0x80))).to.equal(false);
	});
	it("should decode true", function(){
		expect(aj.decode(bb(0x81))).to.equal(true);
	});
	it("should decode null", function(){
		expect(aj.decode(bb(0x82))).to.equal(null);
	});
	it("should decode integers", function(){
		expect(aj.decode(bb(6))).to.equal(6);
		expect(aj.decode(bb(4))).to.equal(4);
		expect(aj.decode(bb(0xA0, 0x82))).to.equal(0x82);
		expect(aj.decode(bb(0xA1, 0x4D, 0xFC))).to.equal(0x4DFC);
		expect(aj.decode(bb(0xA2, 0x4D, 0xFC, 0x42, 0x32))).to.equal(0x4DFC4232);
		expect(aj.decode(
			bb(0xA3, 0x00, 0x0C, 0x42, 0x32, 0x12, 0x34, 0x56, 0x78)
		)).to.equal(0x000C423212345678);
		
		expect(aj.decode(bb(0xFF))).to.equal(-1);
		expect(aj.decode(bb(0xF0))).to.equal(-16);
		expect(aj.decode(bb(0xE1))).to.equal(-31);
		expect(aj.decode(bb(0xE0))).to.equal(-32);
		expect(aj.decode(bb(0xA8, -33))).to.equal(-33);
		expect(aj.decode(bb(0xA9, 0xC0, 0x00))).to.equal(-0x4000);
	});
	it("should decode doubles", function(){
		expect(aj.decode([0x83, 0x40, 0x0C, 0,0,0,0,0,0])).to.equal(3.5);
	});
	it("should decode strings", function(){
		expect(aj.decode([0x43, 0x30, 0x31, 0x32])).to.equal('012');
		expect(aj.decode([0xB0, 0x80,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
			0x30, 0x31, 0x30, 0x31, 0x30, 0x31, 0x30, 0x31,
		])).to.equal(new Array(65).join("01"));
	});
	it("should decode arrays", function(){
		expect(aj.decode([0xC0])).to.eql([]);
		expect(aj.decode([0xC3, 1,2,3])).to.eql([1,2,3]);
		
		var e = new Array(0x0124).join(0).split('').map(function(){ return 42 });
		var b = e.slice(0); b.unshift(0x91, 0x01, 0x23);
		expect(aj.decode(b)).to.eql(e);
	});
	it("should decode dictionaries", function(){
		expect(aj.decode([0xD0])).to.eql({});
		expect(aj.decode([0xD2, 0x41, 0x33, 3, 0x41, 0x34, 4])).to.eql({"3":3,"4":4});
		expect(aj.decode([0x98, 2, 1, 2, 3, 4])).to.eql({"1":2,"3":4});
	});
});

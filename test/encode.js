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

describe(".encode()", function()
{
	it("should encode false", function(){
		expect(aj.encode(false)).to.eql(new Uint8Array([0x80]));
	});
	it("should encode true", function(){
		expect(aj.encode(true)).to.eql(new Uint8Array([0x81]));
	});
	it("should encode null", function(){
		expect(aj.encode(null     )).to.eql(new Uint8Array([0x82]));
		expect(aj.encode(undefined)).to.eql(new Uint8Array([0x82]));
	});
	it("should encode integers", function(){
		expect(aj.encode(4)).to.eql(new Uint8Array([4]));
		expect(aj.encode(0x82)).to.eql(new Uint8Array([0xA0, 0x82]));
		expect(aj.encode(0x4DFC)).to.eql(new Uint8Array([0xA1, 0x4D, 0xFC]));
		expect(aj.encode(0x4DFC4232)).to.eql(new Uint8Array([0xA2, 0x4D, 0xFC, 0x42, 0x32]));
		expect(aj.encode(0x000C423212345678)).to.eql(
			new Uint8Array([0xA3, 0x00, 0x0C, 0x42, 0x32, 0x12, 0x34, 0x56, 0x78]
		));
		
		expect(aj.encode(-1)).to.eql(new Uint8Array([0xFF]));
		expect(aj.encode(-16)).to.eql(new Uint8Array([0xF0]));
		expect(aj.encode(-31)).to.eql(new Uint8Array([0xE1]));
		expect(aj.encode(-32)).to.eql(new Uint8Array([0xE0]));
		expect(aj.encode(-33)).to.eql(new Uint8Array([0xA8, -33]));
		expect(aj.encode(-0x4000)).to.eql(new Uint8Array([0xA9, 0xC0, 0x00]));
	});
	it("should encode doubles", function(){
		expect(aj.encode(3.5)).to.eql(new Uint8Array([0x83, 0x40, 0x0C, 0,0,0,0,0,0]));
	});
	it("should encode strings", function(){
		expect(aj.encode("012")).to.eql(new Uint8Array([0x43, 0x30, 0x31, 0x32]));
		expect(aj.encode(new Array(65).join("01"))).to.eql(
			new Uint8Array([0xB0, 0x80,
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
			])
		);
	});
	it("should encode arrays", function(){
		expect(aj.encode([])).to.eql(new Uint8Array([0xC0]));
		expect(aj.encode([1,2,3])).to.eql(new Uint8Array([0xC3, 1, 2, 3]));
		
		var a = new Array(0x0124).join(0).split('').map(function(){ return 42 });
		var e = a.slice(0); e.unshift(0x91, 0x01, 0x23);
		expect(aj.encode(a)).to.eql(new Uint8Array(e));
	});
	it("should encode dictionaries", function(){
		expect(aj.encode({})).to.eql(new Uint8Array([0xD0]));
		expect(aj.encode({
			"0":   0,
			"1":   1,
			"2":   2,
			"3":   3,
			"4":   4,
			"5":   5,
			"6":   6,
			"7":   7,
			"8":   8,
			"9":   9,
			"10": 10,
			"11": 11,
			"12": 12,
			"13": 13,
			"14": 14,
			"15": 15,
			"16": 16,
			"17": 17,
			"18": 18,
			"19": 19,
			"20": 20,
			"21": 21,
			"22": 22,
			"23": 23,
			"24": 24,
			"25": 25,
			"26": 26,
			"27": 27,
			"28": 28,
			"29": 29,
			"30": 30,
			"31": 31,
			"32": 32,
			"33": 33,
			"34": 34,
			"35": 35,
			"36": 36,
			"37": 37,
			"38": 38,
			"39": 39,
			"40": 40,
			"41": 41,
			"42": 42,
			"43": 43,
			"44": 44,
			"45": 45,
			"46": 46,
			"47": 47,
			"48": 48,
			"49": 49,
			"50": 50,
			"51": 51,
			"52": 52,
			"53": 53,
			"54": 54,
			"55": 55,
			"56": 56,
			"57": 57,
			"58": 58,
			"59": 59,
		})).to.eql(new Uint8Array([0x98, 60,
			0x41, 48, 0,
			0x41, 49, 1,
			0x41, 50, 2,
			0x41, 51, 3,
			0x41, 52, 4,
			0x41, 53, 5,
			0x41, 54, 6,
			0x41, 55, 7,
			0x41, 56, 8,
			0x41, 57, 9,
			0x42, 49, 48, 10,
			0x42, 49, 49, 11,
			0x42, 49, 50, 12,
			0x42, 49, 51, 13,
			0x42, 49, 52, 14,
			0x42, 49, 53, 15,
			0x42, 49, 54, 16,
			0x42, 49, 55, 17,
			0x42, 49, 56, 18,
			0x42, 49, 57, 19,
			0x42, 50, 48, 20,
			0x42, 50, 49, 21,
			0x42, 50, 50, 22,
			0x42, 50, 51, 23,
			0x42, 50, 52, 24,
			0x42, 50, 53, 25,
			0x42, 50, 54, 26,
			0x42, 50, 55, 27,
			0x42, 50, 56, 28,
			0x42, 50, 57, 29,
			0x42, 51, 48, 30,
			0x42, 51, 49, 31,
			0x42, 51, 50, 32,
			0x42, 51, 51, 33,
			0x42, 51, 52, 34,
			0x42, 51, 53, 35,
			0x42, 51, 54, 36,
			0x42, 51, 55, 37,
			0x42, 51, 56, 38,
			0x42, 51, 57, 39,
			0x42, 52, 48, 40,
			0x42, 52, 49, 41,
			0x42, 52, 50, 42,
			0x42, 52, 51, 43,
			0x42, 52, 52, 44,
			0x42, 52, 53, 45,
			0x42, 52, 54, 46,
			0x42, 52, 55, 47,
			0x42, 52, 56, 48,
			0x42, 52, 57, 49,
			0x42, 53, 48, 50,
			0x42, 53, 49, 51,
			0x42, 53, 50, 52,
			0x42, 53, 51, 53,
			0x42, 53, 52, 54,
			0x42, 53, 53, 55,
			0x42, 53, 54, 56,
			0x42, 53, 55, 57,
			0x42, 53, 56, 58,
			0x42, 53, 57, 59,
		]));
	});
});

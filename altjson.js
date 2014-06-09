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

+function(factory){
	"use strict";
	
	if (typeof define == "function" && define.amd) { // AMD
		define([], factory.bind(window));
	} else if (typeof module == "object" && module.exports) { // Node
		module.exports = factory(global);
	} else {
		window.AltJSON = factory(window);
	}
}(function(global){
	"use strict";
	
	var BOOL      = 0x80;
	var BOOL_MASK = 0xFE;
	var FALSE     = 0x80;
	var TRUE      = 0x81;
	
	var NULL      = 0x82;
	var DOUBLE    = 0x83;
	
	//              0b1010sbbb
	var INT       = 0xA0;
	var INT_MASK  = 0xF0;
	var INT_SIGN  = 0x08;
	var INT_BYTE  = 0x07;
	
	//              0b10110bbb # 2^(b+1) bytes.
	var STR       = 0xB0;
	var STR_MASK  = 0xF8;
	var STR_BYTE  = 0x07;
	
	//              0b10011bbb
	var DIC       = 0x98;
	var DIC_MASK  = 0xF8;
	var DIC_BYTE  = 0x07;
	
	//              0b11011bbb
	var ARR       = 0x90;
	var ARR_MASK  = 0xF8;
	var ARR_BYTE  = 0x07;
	
	//              0b00vvvvvv
	var INT_SHORT = 0x00;
	var INT_SMASK = 0xC0;
	
	//              0b111vvvvv # 2's comp
	var INT_NEG   = 0xE0;
	var INT_NMASK = 0xE0;
	
	//              0b01vvvvvv
	var STR_SHORT = 0x40;
	var STR_SMASK = 0xC0;
	var STR_SLEN  = 0x3F;
	
	//              0b1101llll
	var DIC_SHORT = 0xD0;
	var DIC_SMASK = 0xF0;
	var DIC_SLEN  = 0x0F;
	
	//              0b1100llll
	var ARR_SHORT = 0xC0;
	var ARR_SMASK = 0xF0;
	var ARR_SLEN  = 0x0F;
	
	function totalsize(a) {
		var s = 0;
		for (var i = 0; i < a.length; i++) {
			s += a[i].byteLength; // Really? Why not call it length?
		}
		return s;
	}
	function joinbuf(a) {
		var r = new Uint8Array(totalsize(a));
		var o = 0;
		
		for (var i = 0; i < a.length; i++) {
			r.set(a[i], o);
			o += a[i].byteLength;
		}
		
		return r;
	}
	
	if (typeof TextEncoder == "undefined") {
		var te = require("text-encoding");
		global.TextEncoder = te.TextEncoder;
		global.TextDecoder = te.TextDecoder;
	}
	var utf8encoder = TextEncoder("utf-8");
	var utf8decoder = TextDecoder("utf-8");
	
	function encode(v, a) {
		switch (typeof v) {
		case "boolean":
			eBool(v, a);
			break;
		case "number":
			if (Math.floor(v) == v) eInt(v, a);
			else                    eDouble(v, a);
			break;
		case "string":
			eStr(v, a);
			break;
		case "undefined":
			// Fall through and handle as null.
		case "object":
			if (!v) eNull(v, a); // Why null is an object? Because Javascript.
			else if (Array.isArray(v)) eArr(v, a);
			else eDic(v, a);
			break;
		default:
			throw new TypeError("Can't serialize "+typeof v+".");
		}
		
		return a;
	}
	
	function eBool(b, a) {
		a.push(new Uint8Array([ b? TRUE:FALSE ]));
		
		return a;
	}
	
	function eNull(v, a) {
		a.push(new Uint8Array([ NULL ]));
		
		return a;
	}
	
	function eInt(i, a, short) {
		if (typeof short == "undefined") short = true;
		
		var sign = 0;
		var bits = i;
		if (i < 0) {
			sign = INT_SIGN;
			bits = -i*2 - 1;
		}
		
		// What a disaster.  Why are typed arrays so hard to use.
		if      (bits <= 0x3F && short)
			a.push(new Uint8Array([i]));
		else if (bits <= 0xFF)
			a.push(new Uint8Array([INT|sign, i]));
		else if (bits <= 0xFFFF) {
			var b = new Uint8Array(3);
			b[0] = INT|sign|1;
			new DataView(b.buffer).setUint16(1, i);
			a.push(b);
		} else if (bits <= 0xFFFFFFFF) {
			var b = new Uint8Array(5);
			b[0] = INT|sign|2;
			new DataView(b.buffer).setUint32(1, i);
			a.push(b);
		} else if (bits <= 0xFFFFFFFFFFFFFFFF) { // Doubles can't actually hold this.
			var b = new Uint8Array(9);
			b[0] = INT|sign|3;
			var v = new DataView(b.buffer)
			v.setUint32(1, i / Math.pow(2,32)); // Divide because bitwise operations
			v.setUint32(5, i);                  // truncate to 32 bits.
			a.push(b);
		} else throw new TypeError("Can't encode "+i);
		
		return a;
	}
	
	function eDouble(d, a) {
		var b = new Uint8Array(9);
		b[0] = DOUBLE;
		new DataView(b.buffer).setFloat64(1, d);
		a.push(b);
		return a;
	}
	
	function eStr(s, a) {
		var s = utf8encoder.encode(s);
		var l;
		
		if (s.byteLength <= STR_SLEN) {
			l = new Uint8Array([STR_SHORT|s.byteLength]);
		} else {
			l = eInt(s.byteLength, [], false)[0];
			l[0] = STR | l[0] & STR_BYTE;
		}
		
		a.push(l, s);
		
		return a;
	}
	
	function eArr(a, o) {
		var l;
		if (a.length <= ARR_SLEN) {
			l = new Uint8Array([ARR_SHORT|a.length]);
		} else {
			l = eInt(a.length, [], false)[0];
			l[0] = ARR | l[0] & ARR_BYTE;
		}
		o.push(l);
		
		for (var i = 0; i < a.length; i++)
			encode(a[i], o);
		
		return o;
	}
	
	function eDic(d, o) {
		var k = Object.keys(d);
		var l;
		if (k.length <= DIC_SLEN) {
			l = new Uint8Array([DIC_SHORT|k.length]);
		} else {
			l = eInt(k.length, [], false)[0];
			l[0] = DIC | l[0] & DIC_BYTE;
		}
		o.push(l);
		
		for (var i = 0; i < k.length; i++)
			encode(k[i], o), encode(d[k[i]], o);
		
		return o;
	}
	
	function decode(buf, i) {
		var t = buf.getUint8(i++);
		
		var r;
		if ((t & STR_SMASK) == STR_SHORT) {
			var l = t & STR_SLEN;
			r = dStr(buf, i, l);
			i += l;
		} else if ((t & STR_MASK) == STR) {
			var l = dInt(buf, i, t&STR_BYTE);
			i = l[1];
			r = dStr(buf, i, l[0]);
			i += l[0];
		}
		else if (t == FALSE) r = false;
		else if (t == TRUE ) r = true;
		else if (t == NULL ) r = null;
		else if ((t & INT_SMASK) == INT_SHORT) r = t;
		else if ((t & INT_NMASK) == INT_NEG  ) r = buf.getInt8(i-1);
		else if ((t & INT_MASK ) == INT) {
			var p = dInt(buf, i, t&INT_BYTE, t&INT_SIGN);
			r = p[0];
			i = p[1];
		} else if ((t & ARR_SMASK ) == ARR_SHORT) {
			var l = t & ARR_SLEN;
			var p = dArr(buf, i, l);
			r = p[0];
			i = p[1];
		} else if ((t & ARR_MASK ) == ARR) {
			var l = dInt(buf, i, t&ARR_BYTE);
			i = l[1];
			var p = dArr(buf, i, l[0]);
			r = p[0];
			i = p[1];
		} else if ((t & DIC_SMASK ) == DIC_SHORT) {
			var l = t & DIC_SLEN;
			var p = dDic(buf, i, l);
			r = p[0];
			i = p[1];
		} else if ((t & DIC_MASK ) == DIC) {
			var l = dInt(buf, i, t&DIC_BYTE);
			i = l[1];
			var p = dDic(buf, i, l[0]);
			r = p[0];
			i = p[1];
		} else if (t == DOUBLE) {
			r = buf.getFloat64(i);
			i += 8;
		} else
			throw new TypeError("Uknown tag 0x"+t.toString(16).toUpperCase())
		
		return [r, i];
	}
	
	function dInt(buf, i, b, s) {
		var bytes = Math.pow(2, b);
		if (bytes > 4) { // Try our best to read larger numbers.
			var r = 0;
			while (bytes) {
				// Don't use bitwise or it gets truncated to 32 bits.
				r = r * Math.pow(2,32) + buf["get"+(s?"I":"Ui")+"nt32"](i);
				bytes -= 4;
				i += 4;
			}
			return [r, i];
		}
		
		return [buf["get"+(s?"I":"Ui")+"nt"+bytes*8](i), i+bytes];
	}
	
	function dStr(buf, i, l) {
		var view = new Uint8Array(buf.buffer, i, l);
		return utf8decoder.decode(view);
	}
	
	function dArr(buf, i, l) {
		var r = new Array(l);
		for (var e = 0; e < l; e++) {
			var p = decode(buf, i);
			r[e] = p[0];
			i = p[1];
		}
		return [r, i];
	}
	
	function dDic(buf, i, l) {
		var r = {};
		for (var e = 0; e < l; e++) {
			var k = decode(buf, i);
			i = k[1];
			var v = decode(buf, i);
			i = v[1];
			r[k[0]] = v[0];
		}
		return [r, i];
	}
	
	var self = Object.create(null, {
		VERSION: {value: "1.0.0"},
		
		encode: {
			value: function AltJSON_encode(v) {
				var r = [];
				
				encode(v, r);
				
				return joinbuf(r);
			},
		},
		
		decode: {
			value: function AltJSON_decode(buf) {
				buf = new DataView(new Uint8Array(buf).buffer);
				var r = decode(buf, 0);
				
				if (r[1] != buf.byteLength)
					throw new TypeError("Junk ("+(buf.byteLength-r[1])+" bytes) in end of buffer.");
				
				return r[0];
			},
		},
	});
	Object.preventExtensions(self);
	return self;
});

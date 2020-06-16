// // TextEncoder/TextDecoder polyfills for utf-8 - an implementation of TextEncoder/TextDecoder APIs
// // Written in 2013 by Viktor Mukhachev <vic99999@yandex.ru>
// // To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
// // You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

// // Some important notes about the polyfill below:
// // Native TextEncoder/TextDecoder implementation is overwritten
// // String.prototype.codePointAt polyfill not included, as well as String.fromCodePoint
// // TextEncoder.prototype.encode returns a regular array instead of Uint8Array
// // No options (fatal of the TextDecoder constructor and stream of the TextDecoder.prototype.decode method) are supported.
// // TextDecoder.prototype.decode does not valid byte sequences
// // This is a demonstrative implementation not intended to have the best performance

// // http://encoding.spec.whatwg.org/#textencoder

// // http://encoding.spec.whatwg.org/#textencoder

// (function(window) {
//   "use strict";

//   function TextEncoder() {}

//   TextEncoder.prototype.encode = function(string) {
//     var octets = [];
//     var length = string.length;
//     var i = 0;
//     while (i < length) {
//       var codePoint = string.codePointAt(i);
//       var c = 0;
//       var bits = 0;
//       if (codePoint <= 0x0000007f) {
//         c = 0;
//         bits = 0x00;
//       } else if (codePoint <= 0x000007ff) {
//         c = 6;
//         bits = 0xc0;
//       } else if (codePoint <= 0x0000ffff) {
//         c = 12;
//         bits = 0xe0;
//       } else if (codePoint <= 0x001fffff) {
//         c = 18;
//         bits = 0xf0;
//       }
//       octets.push(bits | (codePoint >> c));
//       c -= 6;
//       while (c >= 0) {
//         octets.push(0x80 | ((codePoint >> c) & 0x3f));
//         c -= 6;
//       }
//       i += codePoint >= 0x10000 ? 2 : 1;
//     }
//     return octets;
//   };

//   if (!window["TextEncoder"]) window["TextEncoder"] = TextEncoder;

//   function TextDecoder() {}

//   TextDecoder.prototype.decode = function(octets) {
//     var string = "";
//     var i = 0;
//     while (i < octets.length) {
//       var octet = octets[i];
//       var bytesNeeded = 0;
//       var codePoint = 0;
//       if (octet <= 0x7f) {
//         bytesNeeded = 0;
//         codePoint = octet & 0xff;
//       } else if (octet <= 0xdf) {
//         bytesNeeded = 1;
//         codePoint = octet & 0x1f;
//       } else if (octet <= 0xef) {
//         bytesNeeded = 2;
//         codePoint = octet & 0x0f;
//       } else if (octet <= 0xf4) {
//         bytesNeeded = 3;
//         codePoint = octet & 0x07;
//       }
//       if (octets.length - i - bytesNeeded > 0) {
//         var k = 0;
//         while (k < bytesNeeded) {
//           octet = octets[i + k + 1];
//           codePoint = (codePoint << 6) | (octet & 0x3f);
//           k += 1;
//         }
//       } else {
//         codePoint = 0xfffd;
//         bytesNeeded = octets.length - i;
//       }
//       string += String.fromCodePoint(codePoint);
//       i += bytesNeeded + 1;
//     }
//     return string;
//   };

//   if (!window["TextDecoder"]) window["TextDecoder"] = TextDecoder;
// });

// This is free and unencumbered software released into the public domain.

// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.

// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

// For more information, please refer to <http://unlicense.org>
//https://github.com/anonyco/FastestSmallestTextEncoderDecoder/blob/master/EncoderDecoderTogether.src.js
(function(window) {
  "use strict";
  var log = Math.log;
  var LN2 = Math.LN2;
  var clz32 =
    Math.clz32 ||
    function(x) {
      return (31 - log(x >>> 0) / LN2) | 0;
    };
  var fromCharCode = String.fromCharCode;
  var Object_prototype_toString = {}.toString;
  var NativeSharedArrayBuffer = window["SharedArrayBuffer"];
  var sharedArrayBufferString = NativeSharedArrayBuffer
    ? Object_prototype_toString.call(NativeSharedArrayBuffer)
    : "";
  var NativeUint8Array = window.Uint8Array;
  var patchedU8Array = NativeUint8Array || Array;
  var arrayBufferString = Object_prototype_toString.call(
    (NativeUint8Array ? ArrayBuffer : patchedU8Array).prototype
  );
  function decoderReplacer(encoded) {
    var codePoint = encoded.charCodeAt(0) << 24;
    var leadingOnes = clz32(~codePoint) | 0;
    var endPos = 0,
      stringLen = encoded.length | 0;
    var result = "";
    if (leadingOnes < 5 && stringLen >= leadingOnes) {
      codePoint = (codePoint << leadingOnes) >>> (24 + leadingOnes);
      for (endPos = 1; endPos < leadingOnes; endPos = (endPos + 1) | 0)
        codePoint =
          (codePoint << 6) | (encoded.charCodeAt(endPos) & 0x3f) /*0b00111111*/;
      if (codePoint <= 0xffff) {
        // BMP code point
        result += fromCharCode(codePoint);
      } else if (codePoint <= 0x10ffff) {
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        codePoint = (codePoint - 0x10000) | 0;
        result += fromCharCode(
          ((codePoint >> 10) + 0xd800) | 0, // highSurrogate
          ((codePoint & 0x3ff) + 0xdc00) | 0 // lowSurrogate
        );
      } else endPos = 0; // to fill it in with INVALIDs
    }
    for (; endPos < stringLen; endPos = (endPos + 1) | 0) result += "\ufffd"; // replacement character
    return result;
  }
  function TextDecoder() {}
  TextDecoder["prototype"]["decode"] = function(octets) {
    if (!octets) return "";
    var string = "";
    var i = 0;
    while (i < octets.length) {
      var octet = octets[i];
      var bytesNeeded = 0;
      var codePoint = 0;
      if (octet <= 0x7f) {
        bytesNeeded = 0;
        codePoint = octet & 0xff;
      } else if (octet <= 0xdf) {
        bytesNeeded = 1;
        codePoint = octet & 0x1f;
      } else if (octet <= 0xef) {
        bytesNeeded = 2;
        codePoint = octet & 0x0f;
      } else if (octet <= 0xf4) {
        bytesNeeded = 3;
        codePoint = octet & 0x07;
      }
      if (octets.length - i - bytesNeeded > 0) {
        var k = 0;
        while (k < bytesNeeded) {
          octet = octets[i + k + 1];
          codePoint = (codePoint << 6) | (octet & 0x3f);
          k += 1;
        }
      } else {
        codePoint = 0xfffd;
        bytesNeeded = octets.length - i;
      }
      string += String.fromCodePoint(codePoint);
      i += bytesNeeded + 1;
    }
    return string;

    // var buffer =
    //   (inputArrayOrBuffer && inputArrayOrBuffer.buffer) || inputArrayOrBuffer;
    // if (buffer === undefined) {
    //   return undefined;
    // }
    // var asObjectString = Object_prototype_toString.call(buffer);
    // if (
    //   asObjectString !== arrayBufferString &&
    //   asObjectString !== sharedArrayBufferString
    // )
    //   throw Error(
    //     "Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'"
    //   );
    // var inputAs8 = NativeUint8Array ? new patchedU8Array(buffer) : buffer;
    // var resultingString = "";
    // for (
    //   var index = 0, len = inputAs8.length | 0;
    //   index < len;
    //   index = (index + 32768) | 0
    // )
    //   resultingString += fromCharCode.apply(
    //     0,
    //     inputAs8[NativeUint8Array ? "subarray" : "slice"](
    //       index,
    //       (index + 32768) | 0
    //     )
    //   );

    // return resultingString.replace(/[\xc0-\xff][\x80-\xbf]*/g, decoderReplacer);
  };
  if (!window["TextDecoder"]) window["TextDecoder"] = TextDecoder;
  //////////////////////////////////////////////////////////////////////////////////////
  function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    var point = nonAsciiChars.charCodeAt(0) | 0;
    if (point >= 0xd800 && point <= 0xdbff) {
      var nextcode = nonAsciiChars.charCodeAt(1) | 0;
      if (nextcode !== nextcode)
        // NaN because string is 1 code point long
        return fromCharCode(
          0xef /*11101111*/,
          0xbf /*10111111*/,
          0xbd /*10111101*/
        );
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
        point = (((point - 0xd800) << 10) + nextcode - 0xdc00 + 0x10000) | 0;
        if (point > 0xffff)
          return fromCharCode(
            (0x1e /*0b11110*/ << 3) | (point >>> 18),
            (0x2 /*0b10*/ << 6) | ((point >>> 12) & 0x3f) /*0b00111111*/,
            (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/,
            (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/
          );
      } else return fromCharCode(0xef, 0xbf, 0xbd);
    }
    if (point <= 0x007f) return nonAsciiChars;
    else if (point <= 0x07ff) {
      return fromCharCode(
        (0x6 << 5) | (point >>> 6),
        (0x2 << 6) | (point & 0x3f)
      );
    } else
      return fromCharCode(
        (0xe /*0b1110*/ << 4) | (point >>> 12),
        (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/,
        (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/
      );
  }
  function TextEncoder() {}
  TextEncoder["prototype"]["encode"] = function(inputString) {
    // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
    // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
    var encodedString =
      inputString === void 0
        ? ""
        : ("" + inputString).replace(
            /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,
            encoderReplacer
          );
    var len = encodedString.length | 0,
      result = new patchedU8Array(len);
    for (var i = 0; i < len; i = (i + 1) | 0)
      result[i] = encodedString.charCodeAt(i);
    return result;
  };
  if (!window["TextEncoder"]) window["TextEncoder"] = TextEncoder;
})(
  typeof globalThis == "" + void 0
    ? typeof global == "" + void 0
      ? typeof self == "" + void 0
        ? this
        : self
      : global
    : globalThis
);

/* eslint-disable */
const fs = require("fs");
const { promisify } = require("util");

function toArrayBuffer(buf: any) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

/**
 * Fetch implementation used by tests to load local files that are normally served
 * in the real application.
 *
 * @param input
 * @param init
 */
async function fetchLocal(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const buffer = await promisify(fs.readFile)(input, {});

  return {
    arrayBuffer: async () => toArrayBuffer(buffer),
  } as Response;
}

(globalThis as any).fetch = fetchLocal;

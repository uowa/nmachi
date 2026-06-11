// AudioWorklet processor — RNNoise ML noise suppression
// rnnoise-sync.js uses import.meta.url; AudioWorklet needs self.location polyfill
if (typeof globalThis.self === 'undefined' || typeof globalThis.self.location === 'undefined') {
  globalThis.self = globalThis.self || {};
  globalThis.self.location = { href: import.meta.url };
}
// atob polyfill (needed by Emscripten base64 decoder in some environments)
if (typeof globalThis.atob === 'undefined') {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  globalThis.atob = (str) => {
    str = str.replace(/[\t\n\r ]/g, '');
    let out = '', i = 0;
    while (i < str.length) {
      const [a, b, c, d] = [CHARS.indexOf(str[i++]), CHARS.indexOf(str[i++]), CHARS.indexOf(str[i++]), CHARS.indexOf(str[i++])];
      out += String.fromCharCode((a << 2) | (b >> 4), ((b & 15) << 4) | (c >> 2), ((c & 3) << 6) | d);
    }
    return out;
  };
}

import createRNNWasmModuleSync from './rnnoise-sync.js';

const FRAME_SIZE = 480;
const BUF_SIZE = 1920; // lcm(128, 480)

class RNNoiseNode extends AudioWorkletProcessor {
  constructor() {
    super();
    this._enabled = true;
    this._ready = false;

    this.port.onmessage = (e) => {
      if (e.data.type === 'enable') this._enabled = e.data.value;
    };

    try {
      const mod = createRNNWasmModuleSync();
      this._mod = mod;
      this._state = mod._rnnoise_create();
      this._buf = mod._malloc(FRAME_SIZE * 4);
      this._bufIdx = this._buf >> 2;
      this._circBuf = new Float32Array(BUF_SIZE);
      this._inLen = 0;
      this._denoisedLen = 0;
      this._outIdx = 0;
      this._ready = true;
    } catch (_e) {
      // fallback: passthrough if WASM fails
    }
  }

  _denoiseFrame(frame) {
    for (let i = 0; i < FRAME_SIZE; i++) {
      this._mod.HEAPF32[this._bufIdx + i] = frame[i] * 32768;
    }
    this._mod._rnnoise_process_frame(this._state, this._buf, this._buf);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = this._mod.HEAPF32[this._bufIdx + i] / 32768;
    }
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!input || !output) return true;

    if (!this._ready || !this._enabled) {
      output.set(input);
      return true;
    }

    this._circBuf.set(input, this._inLen);
    this._inLen += input.length; // 128

    for (; this._denoisedLen + FRAME_SIZE <= this._inLen; this._denoisedLen += FRAME_SIZE) {
      this._denoiseFrame(this._circBuf.subarray(this._denoisedLen, this._denoisedLen + FRAME_SIZE));
    }

    const available = this._outIdx > this._denoisedLen
      ? BUF_SIZE - this._outIdx
      : this._denoisedLen - this._outIdx;
    if (available >= output.length) {
      output.set(this._circBuf.subarray(this._outIdx, this._outIdx + output.length));
      this._outIdx += output.length;
    }

    if (this._outIdx >= BUF_SIZE) this._outIdx = 0;
    if (this._inLen >= BUF_SIZE) { this._inLen = 0; this._denoisedLen = 0; }

    return true;
  }
}

registerProcessor('rnnoise-processor', RNNoiseNode);

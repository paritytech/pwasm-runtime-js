'use strict';var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _long = require('long');var _long2 = _interopRequireDefault(_long);

var _runtime = require('./runtime');
var _externalities = require('./externalities');
var _types = require('./types');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

test('elog', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/events.wasm');
    let ext = new _externalities.Externalities();
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());

    expect(ext.logs.length).toBe(1);
});

test('create', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/creator.wasm');
    let ext = new _externalities.Externalities();
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());

    expect(ext.creates.length).toBe(1);
});

test('dcall', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/call_code.wasm');
    let ext = new _externalities.Externalities();
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
});

test('dcall', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/call_code.wasm');
    let ext = new _externalities.Externalities();
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
});

test('scall', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/call_static.wasm');
    let ext = new _externalities.Externalities();
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
});

test('ccall', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/call.wasm');
    let ext = new _externalities.Externalities();
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
    let call = ext.calls[0];
    expect(call.value.toString()).toEqual(new _long2.default(1000000000).toString());
});

test('storage_read', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/storage_read.wasm');
    let ext = new _externalities.Externalities();

    ext.setStorage(
    _types.H256.fromString("0x0100000000000000000000000000000000000000000000000000000000000000"),
    _types.H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));

    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());
    expect(new _types.H256(result)).
    toEqual(_types.H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));
});

test('keccak', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/keccak1.wasm');
    let ext = new _externalities.Externalities();
    let bytes = Uint8Array.from("something".split("").map(c => c.charCodeAt()));
    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default(), bytes);
    expect(new _types.H256(result)).
    toEqual(_types.H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});

test('externs', async () => {
    let wasm = _fs2.default.readFileSync('/Users/fro/parity/wasm-tests/compiled/externs.wasm');
    let ext = new _externalities.Externalities({
        envInfo: {
            blocknumber: _long2.default.fromString("353464564536345623"),
            timestamp: _long2.default.fromString("666666666663322768") } });



    let result = await (0, _runtime.exec)(ext, wasm, _runtime.RuntimeContext.default());
    expect(_long2.default.fromBytesLE(result.slice(0, 8))).toEqual(_long2.default.fromString("666666666663322768"));
    expect(_long2.default.fromBytesLE(result.slice(8, 16))).toEqual(_long2.default.fromString("353464564536345623"));

    // expect(new H256(result))
    //     .toEqual(H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});
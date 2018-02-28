import fs from 'fs';
import Long from 'long';

import { exec, Externalities, RuntimeContext, CALL_TYPE, H256 } from ".";

test('elog', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/events.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default());

    expect(ext.logs.length).toBe(1);
});

test('create', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/creator.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default());

    expect(ext.creates.length).toBe(1);
});

test('dcall', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/call_code.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
});

test('dcall', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/call_code.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
});

test('scall', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/call_static.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
});

test('ccall', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/call.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default());

    expect(ext.calls.length).toBe(1);
    let call = ext.calls[0];
    expect(call.value.toString()).toEqual(new Long(1000000000).toString());
});

test('storage_read', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/storage_read.wasm');
    let ext = new Externalities();

    ext.setStorage(
        H256.fromString("0x0100000000000000000000000000000000000000000000000000000000000000"),
        H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));

    let result = await exec(ext, wasm, RuntimeContext.default());
    expect(new H256(result))
        .toEqual(H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));
});

test('keccak', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/keccak1.wasm');
    let ext = new Externalities();
    let bytes = Uint8Array.from("something".split("").map((c) => c.charCodeAt()));
    let result = await exec(ext, wasm, RuntimeContext.default(), bytes);
    expect(new H256(result))
        .toEqual(H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});

test('externs', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/externs.wasm');
    let ext = new Externalities({
        envInfo: {
            blocknumber: Long.fromString("353464564536345623"),
            timestamp: Long.fromString("666666666663322768")
        }
    });

    let result = await exec(ext, wasm, RuntimeContext.default());
    expect(Long.fromBytesLE(result.slice(0, 8))).toEqual(Long.fromString("666666666663322768"));
    expect(Long.fromBytesLE(result.slice(8, 16))).toEqual(Long.fromString("353464564536345623"));

    // expect(new H256(result))
    //     .toEqual(H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});



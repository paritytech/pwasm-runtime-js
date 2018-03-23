// @flow

import fs from 'fs';
import Long from 'long';
import BigNumber from 'bn.js';
import { resolve } from 'path';

import { exec, Externalities, RuntimeContext, CALL_TYPE, H256 } from ".";
import { Address, EnvInfo } from './types';
import { toArrayBuffer } from './utils';

function readFileSync(path): ArrayBuffer {
    return toArrayBuffer(fs.readFileSync(resolve(path)));
}

test('elog', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/events.wasm'));
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));

    expect(ext.logs.length).toBe(1);
});

test('create', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/creator.wasm'));
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));

    expect(ext.creates.length).toBe(1);
});

test('dcall', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/call_code.wasm'));
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));

    expect(ext.calls.length).toBe(1);
});

test('dcall', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/call_code.wasm'));
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));

    expect(ext.calls.length).toBe(1);
});

test('scall', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/call_static.wasm'));
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));

    expect(ext.calls.length).toBe(1);
});

test('ccall', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/call.wasm'));
    let ext = new Externalities();
    let result = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));

    expect(ext.calls.length).toBe(1);
    let call = ext.calls[0];
    expect(call.value).toBeInstanceOf(BigNumber);
    if (call.value instanceof BigNumber) {
        expect(call.value.toString()).toEqual(new BigNumber(1000000000).toString());
    }

});

test('storage_read', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/storage_read.wasm'));
    let ext = new Externalities();

    ext.setStorage(
        H256.fromString("0x0100000000000000000000000000000000000000000000000000000000000000"),
        H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));

    let { data: result } = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));
    expect(new H256(result))
        .toEqual(H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));
});

test('keccak', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/keccak.wasm'));
    let ext = new Externalities();
    let bytes = Uint8Array.from("something".split("").map((c) => c.charCodeAt(0)));
    let { data: result, gasLeft } = await exec(ext, wasm, RuntimeContext.default(), new Long(100000), bytes);
    expect(new H256(result))
        .toEqual(H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});

test('externs', async () => {
    let wasm = readFileSync(resolve('./wasm-tests/compiled/externs.wasm'));
    let ext = new Externalities({
        envInfo: new EnvInfo ({
            blocknumber: Long.fromString("353464564536345623"),
            timestamp: Long.fromString("666666666663322768"),
            author: Address.fromString("0xefefefefefefefefefefefefefefefefefefefef"),
            difficulty: new BigNumber(100000346534),
            gasLimit: new BigNumber(100000),
            lastHashes: [],
            gasUsed: new BigNumber(344444235346232),
        }),
        blockhashes: new Map([
            [Long.fromNumber(0).toString(), H256.fromString("0x9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d")],
            [Long.fromNumber(1).toString(), H256.fromString("0x7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b")],
        ])
    });

    let { data: result } = await exec(ext, wasm, RuntimeContext.default(), new Long(100000));
    expect(new H256(result.slice(0, 32))).toEqual(H256.fromString("0x9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d"));
    expect(new H256(result.slice(32, 64))).toEqual(H256.fromString("0x7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b"));
    expect(new Address(result.slice(64, 84))).toEqual(Address.fromString("0xefefefefefefefefefefefefefefefefefefefef"));
    expect(Long.fromBytesLE(result.slice(84, 92))).toEqual(Long.fromString("666666666663322768"));
    expect(Long.fromBytesLE(result.slice(92, 100))).toEqual(Long.fromString("353464564536345623"));
    // TODO: assert difficulty and gasLimit
});



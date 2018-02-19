import fs from 'fs';
import Long from 'long';

import { exec } from './runtime';
import Externalities from './externalities';
import { H256 } from './types';

test('storage_read', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/storage_read.wasm');
    let ext = new Externalities();

    ext.setStorage(
        H256.fromString("0x010000000000000000000000000000000000000000000000000000000000000"),
        H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));

    let result = await exec(ext, wasm);
    expect(new H256(result))
        .toEqual(H256.fromString("0xaf0fa234a6af46afa23faf23bcbc1c1cb4bcb7bcbe7e7e7ee3ee2edddddddddd"));
});

test('keccak', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/keccak1.wasm');
    let ext = new Externalities();
    let bytes = Uint8Array.from("something".split("").map((c) => c.charCodeAt()));
    let result = await exec(ext, wasm, bytes);
    expect(new H256(result))
        .toEqual(H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});

test('externs', async () => {
    let wasm = fs.readFileSync('/Users/fro/parity/wasm-tests/compiled/externs.wasm');
    let ext = new Externalities();
    let result = await exec(ext, wasm);
    let result_u64 = Long.fromBytesLE(result);
    console.log(result_u64.toString());
    // expect(new H256(result))
    //     .toEqual(H256.fromString("0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87"));
});



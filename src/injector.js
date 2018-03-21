// @flow
import fs from 'fs';
import { resolve } from 'path';

import type { WasmSchedule } from './types';
import TextEncoder from "text-encoding";

let instance: ?WebAssembly$Instance = null;
/**
 * Returns gas counter to the module
 */
export async function inject_gas_counter(contract: ArrayBuffer, schedule: WasmSchedule): Promise<ArrayBuffer> {
    const injectorModuleBuf = fs.readFileSync(resolve(__dirname, "./wasm/gas_injector.wasm"));
    if (!instance) {
        let inst = await WebAssembly.instantiate(injectorModuleBuf);
        instance = inst.instance;
    }
    const contractBytes = new Uint8Array(contract);

    const scheduleString = JSON.stringify(schedule);
    const scheduleBytes = new TextEncoder.TextEncoder('utf-8').encode(scheduleString);

    const contractPtr = instance.exports.alloc(contract.byteLength);
    const schedulePtr = instance.exports.alloc(scheduleBytes.byteLength);

    const memoryBytes = new Uint8Array(instance.exports.memory.buffer);
    memoryBytes.set(contractBytes, contractPtr);
    memoryBytes.set(scheduleBytes, schedulePtr);

    const resultDescPtr = instance.exports.inject_gas(contractPtr, contractBytes.byteLength, schedulePtr, scheduleBytes.byteLength);
    const resDesc = new Int32Array(instance.exports.memory.buffer, resultDescPtr, 2);
    const result = new Uint8Array(instance.exports.memory.buffer, resDesc[0], resDesc[1]).slice();
    instance.exports.dealloc(schedulePtr, scheduleBytes.byteLength);
    instance.exports.dealloc(contractPtr, contract.byteLength);

    // copy result and return buffer
    return result.buffer;
}

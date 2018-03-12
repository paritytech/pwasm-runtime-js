import fs from 'fs';
import { resolve } from 'path';

/**
 * Returns gas counter to the module
 */
export async function inject_gas_counter(contract: ArrayBuffer): Promise<ArrayBuffer> {
    const injectorModuleBuf = fs.readFileSync(resolve(__dirname, "./wasm/gas_injector.wasm"));
    const { instance } = await WebAssembly.instantiate(injectorModuleBuf);
    const ptr = instance.exports.alloc(contract.byteLength);
    const memoryBytes = new Uint8Array(instance.exports.memory.buffer);
    const contractBytes = new Uint8Array(contract);
    memoryBytes.set(contractBytes, ptr);
    const resultDescPtr = instance.exports.inject_gas(ptr, contract.byteLength);
    const resDesc = new Int32Array(instance.exports.memory.buffer, resultDescPtr, 2);
    const result = new Uint8Array(instance.exports.memory.buffer, resDesc[0], resDesc[1]);
    // copy result and return buffer
    return result.slice().buffer;
}

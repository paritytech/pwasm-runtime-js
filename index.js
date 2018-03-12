// @flow

import type { ActionParams } from './src/types';
import { H256, Address } from './src/types';
import { Externalities, CALL_TYPE } from './src/externalities';
import { readImports } from "./src/utils";
import { Runtime, RuntimeContext } from "./src/runtime";
import { inject_gas_counter } from "./src/injector";

export async function exec(
    ext: Externalities,
    module: ArrayBuffer,
    context: RuntimeContext,
    args: Uint8Array = new Uint8Array([])): Promise<Uint8Array> {

    const imports = readImports(module);
    const memory: Object = new global.WebAssembly.Memory(imports.memory.limits);
    const runtime = new Runtime(memory, ext, context, args);
    const instance = await runtime.instantiate(module);
    // Call export
    instance.exports.call();
    // Return result from runtime
    return runtime.result;
}

export async function inject_gas(module: ArrayBuffer): Promise<ArrayBuffer> {
    return inject_gas_counter(module);
}

export { Runtime, RuntimeContext, Externalities, CALL_TYPE, H256, Address, inject_gas_counter };
export type { ActionParams };

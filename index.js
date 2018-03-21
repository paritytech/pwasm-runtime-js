// @flow
import Long from 'long';
import type { ActionParams, Result } from './src/types';
import { H256, Address } from './src/types';
import { Externalities, CALL_TYPE } from './src/externalities';
import { readImports } from "./src/utils";
import { Runtime, RuntimeContext } from "./src/runtime";
import { inject_gas_counter } from "./src/injector";

export async function exec(
    ext: Externalities,
    contract: ArrayBuffer,
    context: RuntimeContext,
    gasLimit: Long,
    args: Uint8Array = new Uint8Array([])): Promise<Result> {

    const imports = readImports(contract);
    const memory: Object = new global.WebAssembly.Memory(imports.memory.limits);

    const adjustedGas = gasLimit.mul(ext.schedule().wasm.opcodes_div).div(ext.schedule().wasm.opcodes_mul);

    const runtime = new Runtime(memory, ext, context, adjustedGas, args);

    // Charge for initial mem. TODO: schedule config
    runtime.charge(imports.memory.limits.initial * 4096);
    const instance = await runtime.instantiate(await inject_gas_counter(contract, ext.schedule().wasm));
    // Call export
    instance.exports.call();
    // Return result from runtime
    return {
        data: runtime.result,
        gasLeft: runtime.gasLeft().mul(ext.schedule().wasm.opcodes_mul).div(ext.schedule().wasm.opcodes_div)
    };
}

export { Runtime, RuntimeContext, Externalities, CALL_TYPE, H256, Address, inject_gas_counter };
export type { ActionParams };

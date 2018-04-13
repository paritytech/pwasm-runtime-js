// @flow
import Long from 'long';
import type { ActionParams, Result } from './types';
import { H256, Address } from './types';
import { Externalities, CALL_TYPE } from './externalities';
import { readImports } from "./utils";
import { Runtime, RuntimeContext } from "./runtime";
import { inject_gas_counter } from "./injector";

/**
 * The main exec function.
 */
export async function exec(
    ext: Externalities,
    contract: ArrayBuffer,
    context: RuntimeContext,
    gasLimit: Long,
    args: Uint8Array = new Uint8Array([])): Promise<Result> {

    const imports = readImports(contract);
    const memory = new WebAssembly.Memory(imports.memory.limits);

    const adjustedGas = gasLimit.mul(ext.schedule().wasm.opcodes_div).div(ext.schedule().wasm.opcodes_mul);

    const runtime = new Runtime(memory, ext, context, adjustedGas, args);

    // Charge for initial mem
    runtime.charge(imports.memory.limits.initial * 4096);
    const instance = await runtime.instantiate(inject_gas_counter(contract, ext.schedule().wasm));
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

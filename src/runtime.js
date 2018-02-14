// @flow

import Externalities from "./externalities";
import { H256 } from "./types";
import { readImports } from "./utils";

export async function exec(ext: Externalities, module: ArrayBuffer): Promise<Uint8Array> {
    const imports = readImports(module);
    const memory: Object = new global.WebAssembly.Memory(imports.memory.limits);
    const runtime = new Runtime(memory, ext);
    const { instance } = await global.WebAssembly.instantiate(module, {env: importObj(runtime)});
    // Call export
    instance.exports.call();
    // Return result from runtime
    return runtime.result;
}

class Runtime {
    buffer: ArrayBuffer;
    memory: Object;
    ext: Externalities;
    result: Uint8Array;

    constructor (memory: Object, ext: Externalities) {
        this.memory = memory;
        this.ext = ext;
        this.buffer = this.memory.buffer;
    }

    fetchH256 (ptr: number): H256 {
        return H256.view(this.buffer, ptr);
    }

    writeInto(ptr: number, value: H256) {
        value.write(this.buffer, ptr);
    }

    /**
     * Read from the storage to wasm memory
     */
    storage_read(keyPtr: number, valPtr: number) {
        let value = this.ext.storageAt(this.fetchH256(keyPtr));
        this.writeInto(valPtr, value);
    }

    /**
     * Write to storage from wasm memory
     */
    storage_write(keyPtr: Number, valPtr: Number) {

    }

    /**
     * Return
     *
     * Syscall takes 2 arguments - pointer in sandboxed memory where result is and
     * the length of the result.
     */
    ret(ptr: number, len: number) {
        this.result = new Uint8Array(this.buffer, ptr, len);
    }

    /**
     * Report gas cost with the params passed in wasm stack
     */
    gas() {

    }

    /**
     * Query the length of the input bytes
     */
    input_length() {

    }

    /**
     * Write input bytes to the memory location using the passed pointer
     */
    fetch_input() {

    }

    /**
     * User panic
     *
     * Contract can invoke this when he encounters unrecoverable error.
     */
    panic() {

    }

    debug() {

    }

    /**
     * Message call
     */
    ccall() {

    }

    /**
     * Delegate call
     */
    dcall() {

    }

    /**
     * Static call
     */
    scall() {

    }

    /**
     * Returns value (in Wei) passed to contract
     */
    value() {

    }

    /**
     * Creates a new contract

	 #Arguments:
     * endowment - how much value (in Wei) transfer to the newly created contract
	 * code_ptr - pointer to the code data
	 * code_len - lenght of the code data
	 * result_ptr - pointer to write an address of the newly created contract
     */
    create() {

    }

    /**
     * Pass suicide to state runtime
     */
    suicide() {

    }

    /**
     * Signature: `fn blockhash(number: i64, dest: *mut u8)`
     */

    blockhash() {

    }
    /**
     * Signature: `fn blocknumber() -> i64`
     */
    blocknumber() {

    }

    /**
     * Signature: `fn coinbase(dest: *mut u8)`
     */
    coinbase() {

    }

    /**
     * Signature: `fn difficulty(dest: *mut u8)`
     */
    difficulty() {

    }

    /**
     * Signature: `fn gaslimit(dest: *mut u8)`
     */
    gaslimit() {

    }

    /**
     * Signature: `timestamp() -> i64`
     */
    timestamp() {

    }

    /**
     * Signature: `fn address(dest: *mut u8)`
     */
    address() {

    }

    /**
     * Signature: `sender(dest: *mut u8)`
     */
    sender() {

    }

    /**
     * Signature: `origin(dest: *mut u8)`
     */
    origin() {

    }

    /**
     * Signature: `fn elog(topic_ptr: *const u8, topic_count: u32, data_ptr: *const u8, data_len: u32)`
     */
    elog() {

    }
}

function importObj(runtime: Runtime): Object {
    let imports = {};

    imports.memory = runtime.memory;

    imports.storage_read = runtime.storage_read.bind(runtime);
    imports.storage_write = runtime.storage_write.bind(runtime);
    imports.ret = runtime.ret.bind(runtime);
    imports.gas = runtime.gas.bind(runtime);
    imports.input_length = runtime.input_length.bind(runtime);
    imports.fetch_input = runtime.fetch_input.bind(runtime);
    imports.panic = runtime.panic.bind(runtime);
    imports.debug = runtime.debug.bind(runtime);
    imports.ccall = runtime.ccall.bind(runtime);
    imports.dcall = runtime.dcall.bind(runtime);
    imports.scall = runtime.scall.bind(runtime);
    imports.address = runtime.address.bind(runtime);
    imports.sender = runtime.sender.bind(runtime);
    imports.origin = runtime.origin.bind(runtime);
    imports.value = runtime.value.bind(runtime);
    imports.suicide = runtime.suicide.bind(runtime);
    imports.blockhash = runtime.blockhash.bind(runtime);
    imports.coinbase = runtime.coinbase.bind(runtime);
    imports.difficulty = runtime.difficulty.bind(runtime);
    imports.blocknumber = runtime.blocknumber.bind(runtime);
    imports.gaslimit = runtime.gaslimit.bind(runtime);
    imports.timestamp = runtime.timestamp.bind(runtime);
    imports.elog = runtime.elog.bind(runtime);

    return imports;
}

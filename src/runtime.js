// @flow

import fs from 'fs';
import Long from 'long';
import BigNumber from 'bn.js';

import { Externalities, CALL_TYPE } from "./externalities";
import { FixedArray, Address, H256 } from "./types";
import { readImports } from "./utils";

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

export class RuntimeContext {
    address: Address;
    sender: Address;
    origin: Address;
    code_address: Address;
    value: BigNumber;

    constructor(address: Address, sender: Address, origin: Address, code_address: Address, value: BigNumber) {
        this.address = address;
        this.sender = sender;
        this.origin = origin;
        this.code_address = code_address;
        this.value = value;
    }

    static default() {
        return new RuntimeContext(new Address(new Uint8Array([])),
            new Address(new Uint8Array([])),
            new Address(new Uint8Array([])),
            new Address(new Uint8Array([])),
            new BigNumber(0))
    }
}

class Runtime {
    memory: Object;
    ext: Externalities;
    args: Uint8Array;
    context: RuntimeContext;
    result: Uint8Array;
    i64setHi: Function;
    i64getHi: Function;

    constructor (memory: Object, ext: Externalities, context: RuntimeContext, args: Uint8Array) {
        this.memory = memory;
        this.ext = ext;
        this.args = args;
        this.context = context;
    }

    async instantiate(module: ArrayBuffer): Promise<Object> {
        const imports = {};

        imports.memory = this.memory;
        const proxy = fs.readFileSync('/Users/fro/parity/pwasm-runtime/src/proxy.wasm');
        const {instance: proxyInstance} = await global.WebAssembly.instantiate(proxy, {env: {
            timestamp_u64: this.timestamp_u64.bind(this),
            blocknumber_u64: this.blocknumber_u64.bind(this),
            call_u64: this.call_u64.bind(this),
            dcall_u64: this.dcall_u64.bind(this),
            scall_u64: this.scall_u64.bind(this),
        }});

        this.i64setHi = proxyInstance.exports.i64setHi;
        this.i64getHi = proxyInstance.exports.i64getHi;

        imports.timestamp = proxyInstance.exports.timestamp;
        imports.blocknumber = proxyInstance.exports.blocknumber;
        imports.ccall = proxyInstance.exports.ccall;
        imports.dcall = proxyInstance.exports.dcall;
        imports.scall = proxyInstance.exports.scall;

        imports.create = this.create.bind(this);
        imports.storage_read = this.storage_read.bind(this);
        imports.storage_write = this.storage_write.bind(this);
        imports.ret = this.ret.bind(this);
        imports.gas = this.gas.bind(this);
        imports.input_length = this.input_length.bind(this);
        imports.fetch_input = this.fetch_input.bind(this);
        imports.panic = this.panic.bind(this);
        imports.debug = this.debug.bind(this);
        imports.address = this.address.bind(this);
        imports.sender = this.sender.bind(this);
        imports.origin = this.origin.bind(this);
        imports.value = this.value.bind(this);
        imports.suicide = this.suicide.bind(this);
        imports.blockhash = this.blockhash.bind(this);
        imports.coinbase = this.coinbase.bind(this);
        imports.difficulty = this.difficulty.bind(this);
        imports.gaslimit = this.gaslimit.bind(this);
        imports.elog = this.elog.bind(this);

        const { instance } = await global.WebAssembly.instantiate(module, {env: imports});
        return instance;
    }

    viewAt(ptr: number = 0, len?: number): Uint8Array {
        return new Uint8Array(this.memory.buffer, ptr, len);
    }

    copyAt(ptr: number = 0, len?: number): Uint8Array {
        const newArray = new Uint8Array(len || 0);
        newArray.set(new Uint8Array(this.memory.buffer, ptr, len));
        return newArray;
    }

    viewAddressAt(ptr: number): Address {
        return Address.view(this.memory.buffer, ptr);
    }

    copyAddressAt(ptr: number): Address {
        return Address.copy(this.memory.buffer, ptr);
    }

    viewH256At(ptr: number): H256 {
        return H256.view(this.memory.buffer, ptr);
    }

    copyH256At(ptr: number): H256 {
        return H256.copy(this.memory.buffer, ptr);
    }

    writeInto(ptr: number, value: FixedArray) {
        value.write(this.memory.buffer, ptr);
    }

    writeU256Into(ptr: number, value: BigNumber) {
        const into = new Uint8Array(this.memory.buffer, ptr, 32);
        into.set(value.toArrayLike(Uint8Array, "be", 32));
    }

    copyU256At(ptr: number): BigNumber {
        return new BigNumber(this.copyAt(ptr, 32), 10, 'be');
    }

    /**
     * Query the length of the input bytes
     */
    input_length(): number {
        return this.args.byteLength;
    }

    /**
     * Write input bytes to the memory location using the passed pointer
     */
    fetch_input(inputPtr: number) {
        this.viewAt(inputPtr).set(this.args);
    }

    /**
     * Return
     *
     * Syscall takes 2 arguments - pointer in sandboxed memory where result is and
     * the length of the result.
     */
    ret(ptr: number, len: number) {
        this.result = this.copyAt(ptr, len);
    }

    /**
     * Read from the storage to wasm memory
     */
    storage_read(keyPtr: number, valPtr: number) {
        const value = this.ext.storageAt(this.viewH256At(keyPtr));
        this.writeInto(valPtr, value);
    }

    /**
     * Write to storage from wasm memory
     */
    storage_write(keyPtr: number, valPtr: number) {
        this.ext.setStorage(this.viewH256At(keyPtr), this.viewH256At(valPtr));
    }

     /**
     * Creates a new contract

     #Arguments:
     * valuePtr - how much value (in Wei) transfer to the newly created contract
     * codePtr - pointer to the code data
     * codeLen - length of the code data
     * resultAddrPtr - pointer to write an address of the newly created contract
     */
    create(valuePtr: number, codePtr: number, codeLen: number, resultAddrPtr: number) {
        const createResult = this.ext.create(new Long(), this.copyU256At(valuePtr), this.copyAt(codePtr, codeLen)) // TODO: gaslimit
    }

    /**
     * Message call
     */
    call_u64(u64GasHi: number, u64GasLo: number,
            addrPtr: number,
            valuePtr: number,
            inputPtr: number,
            inputLen: number,
            resultPtr: number,
            resultLen: number): number {
        const resultRefArray = this.viewAt(resultPtr, resultLen);
        const callResult = this.ext.call(Long.fromBits(u64GasLo, u64GasHi),
            this.context.address,
            this.copyAddressAt(addrPtr),
            this.copyU256At(valuePtr),
            this.copyAt(inputPtr, inputLen),
            this.copyAddressAt(addrPtr),
            resultRefArray,
            CALL_TYPE.Call
        );
        // TODO: process callResult
        return 1;
    }

    /**
     * Delegate call
     */
    dcall_u64(u64GasHi: number, u64GasLo: number,
        addrPtr: number,
        inputPtr: number,
        inputLen: number,
        resultPtr: number,
        resultLen: number): number {
        const resultRefArray = this.viewAt(resultPtr, resultLen);
        const callResult = this.ext.call(Long.fromBits(u64GasLo, u64GasHi),
            this.context.address,
            this.copyAddressAt(addrPtr),
            null,
            this.copyAt(inputPtr, inputLen),
            this.copyAddressAt(addrPtr),
            resultRefArray,
            CALL_TYPE.DelegateCall
        );
        // TODO: process callResult
        return 1;
    }

    /**
     * Static call
     */
    scall_u64(u64GasHi: number, u64GasLo: number,
        addrPtr: number,
        inputPtr: number,
        inputLen: number,
        resultPtr: number,
        resultLen: number): number {
        const resultRefArray = this.viewAt(resultPtr, resultLen);
        const callResult = this.ext.call(Long.fromBits(u64GasLo, u64GasHi),
            this.context.address,
            this.copyAddressAt(addrPtr),
            null,
            this.copyAt(inputPtr, inputLen),
            this.copyAddressAt(addrPtr),
            resultRefArray,
            CALL_TYPE.StaticCall
        );
        // TODO: process callResult
        return 1;
    }

    /**
     * Signature: `fn elog(topic_ptr: *const u8, topic_count: u32, data_ptr: *const u8, data_len: u32)`
     */
    elog(topicPtr: number, topicCount: number, dataPtr: number, dataLen: number) {
        const topics = [];
        for (let i = 0; i < topicCount; i++) {
            topics.push(this.copyH256At(topicPtr + 32 * i));
        }
        this.ext.log(topics, this.copyAt(dataPtr, dataLen));
    }

    /**
     * Report gas cost with the params passed in wasm stack
     */
    gas() {

    }

    /**
     * User panic
     *
     * Contract can invoke this when he encounters unrecoverable error.
     */
    panic() {
        throw("Panic in contract");
    }

    debug(ptr) {

    }

    /**
     * Returns value (in Wei) passed to contract
     */
    value(dest) {
        this.writeU256Into(dest, this.context.value);
    }

    /**
     * Pass suicide to state runtime
     */
    suicide(addrPtr: number) {
        this.ext.suicide(this.viewAddressAt(addrPtr));
    }


    /**
     * Signature: `fn coinbase(dest: *mut u8)`
     */
    coinbase(dest: number) {
        this.writeInto(dest, this.ext.getEnvInfo().author);
    }

    /**
     * Signature: `fn difficulty(dest: *mut u8)`
     */
    difficulty(dest) {
        this.writeU256Into(dest, this.ext.getEnvInfo().difficulty);
    }

    /**
     * Signature: `fn gaslimit(dest: *mut u8)`
     */
    gaslimit(dest) {
        this.writeU256Into(dest, this.ext.getEnvInfo().gasLimit);
    }

    /**
     * Signature: `fn blockhash(number: i64, dest: *mut u8)`
     */

    blockhash() {

    }

    /**
     * Signature: `fn blocknumber() -> i64`
     */
    blocknumber_u64(): number {
        const { blocknumber } = this.ext.getEnvInfo();
        this.i64setHi(blocknumber.getHighBits());
        return blocknumber.getLowBits();
    }

    /**
     * Signature: `timestamp() -> i64`
     */
    timestamp_u64(): number {
        const { timestamp } = this.ext.getEnvInfo();
        this.i64setHi(timestamp.getHighBits());
        return timestamp.getLowBits();
    }

    /**
     * Signature: `fn address(dest: *mut u8)`
     */
    address(dest) {
        this.writeInto(dest, this.context.address);
    }

    /**
     * Signature: `sender(dest: *mut u8)`
     */
    sender(dest) {
        this.writeInto(dest, this.context.sender);
    }

    /**
     * Signature: `origin(dest: *mut u8)`
     */
    origin(dest) {
        this.writeInto(dest, this.context.origin);
    }
}

'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.RuntimeContext = undefined;exports.









exec = exec;var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);var _long = require('long');var _long2 = _interopRequireDefault(_long);var _bn = require('bn.js');var _bn2 = _interopRequireDefault(_bn);var _externalities = require('./externalities');var _types = require('./types');var _utils = require('./utils');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}async function exec(
ext,
module,
context,
args = new Uint8Array([])) {

    const imports = (0, _utils.readImports)(module);
    const memory = new global.WebAssembly.Memory(imports.memory.limits);
    const runtime = new Runtime(memory, ext, context, args);
    const instance = await runtime.instantiate(module);
    // Call export
    instance.exports.call();
    // Return result from runtime
    return runtime.result;
}

class RuntimeContext {






    constructor(address, sender, origin, code_address, value) {
        this.address = address;
        this.sender = sender;
        this.origin = origin;
        this.code_address = code_address;
        this.value = value;
    }

    static default() {
        return new RuntimeContext(new _types.Address(new Uint8Array([])),
        new _types.Address(new Uint8Array([])),
        new _types.Address(new Uint8Array([])),
        new _types.Address(new Uint8Array([])),
        new _bn2.default(0));
    }}exports.RuntimeContext = RuntimeContext;


class Runtime {








    constructor(memory, ext, context, args) {
        this.memory = memory;
        this.ext = ext;
        this.args = args;
        this.context = context;
    }

    async instantiate(module) {
        const imports = {};

        imports.memory = this.memory;
        const proxy = _fs2.default.readFileSync('/Users/fro/parity/pwasm-runtime/src/proxy.wasm');
        const { instance: proxyInstance } = await global.WebAssembly.instantiate(proxy, { env: {
                timestamp_u64: this.timestamp_u64.bind(this),
                blocknumber_u64: this.blocknumber_u64.bind(this),
                call_u64: this.call_u64.bind(this),
                dcall_u64: this.dcall_u64.bind(this),
                scall_u64: this.scall_u64.bind(this) } });


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

        const { instance } = await global.WebAssembly.instantiate(module, { env: imports });
        return instance;
    }

    viewAt(ptr = 0, len) {
        return new Uint8Array(this.memory.buffer, ptr, len);
    }

    copyAt(ptr = 0, len) {
        const newArray = new Uint8Array(len || 0);
        newArray.set(new Uint8Array(this.memory.buffer, ptr, len));
        return newArray;
    }

    viewAddressAt(ptr) {
        return _types.Address.view(this.memory.buffer, ptr);
    }

    copyAddressAt(ptr) {
        return _types.Address.copy(this.memory.buffer, ptr);
    }

    viewH256At(ptr) {
        return _types.H256.view(this.memory.buffer, ptr);
    }

    copyH256At(ptr) {
        return _types.H256.copy(this.memory.buffer, ptr);
    }

    writeInto(ptr, value) {
        value.write(this.memory.buffer, ptr);
    }

    writeU256Into(ptr, value) {
        const into = new Uint8Array(this.memory.buffer, ptr, 32);
        into.set(value.toArrayLike(Uint8Array, "be", 32));
    }

    copyU256At(ptr) {
        return new _bn2.default(this.copyAt(ptr, 32), 10, 'be');
    }

    /**
       * Query the length of the input bytes
       */
    input_length() {
        return this.args.byteLength;
    }

    /**
       * Write input bytes to the memory location using the passed pointer
       */
    fetch_input(inputPtr) {
        this.viewAt(inputPtr).set(this.args);
    }

    /**
       * Return
       *
       * Syscall takes 2 arguments - pointer in sandboxed memory where result is and
       * the length of the result.
       */
    ret(ptr, len) {
        this.result = this.copyAt(ptr, len);
    }

    /**
       * Read from the storage to wasm memory
       */
    storage_read(keyPtr, valPtr) {
        const value = this.ext.storageAt(this.viewH256At(keyPtr));
        this.writeInto(valPtr, value);
    }

    /**
       * Write to storage from wasm memory
       */
    storage_write(keyPtr, valPtr) {
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

    create(valuePtr, codePtr, codeLen, resultAddrPtr) {
        const createResult = this.ext.create(new _long2.default(), this.copyU256At(valuePtr), this.copyAt(codePtr, codeLen)); // TODO: gaslimit
    }

    /**
       * Message call
       */
    call_u64(u64GasHi, u64GasLo,
    addrPtr,
    valuePtr,
    inputPtr,
    inputLen,
    resultPtr,
    resultLen) {
        const resultRefArray = this.viewAt(resultPtr, resultLen);
        const callResult = this.ext.call(_long2.default.fromBits(u64GasLo, u64GasHi),
        this.context.address,
        this.copyAddressAt(addrPtr),
        this.copyU256At(valuePtr),
        this.copyAt(inputPtr, inputLen),
        this.copyAddressAt(addrPtr),
        resultRefArray,
        _externalities.CALL_TYPE.Call);

        // TODO: process callResult
        return 1;
    }

    /**
       * Delegate call
       */
    dcall_u64(u64GasHi, u64GasLo,
    addrPtr,
    inputPtr,
    inputLen,
    resultPtr,
    resultLen) {
        const resultRefArray = this.viewAt(resultPtr, resultLen);
        const callResult = this.ext.call(_long2.default.fromBits(u64GasLo, u64GasHi),
        this.context.address,
        this.copyAddressAt(addrPtr),
        null,
        this.copyAt(inputPtr, inputLen),
        this.copyAddressAt(addrPtr),
        resultRefArray,
        _externalities.CALL_TYPE.DelegateCall);

        // TODO: process callResult
        return 1;
    }

    /**
       * Static call
       */
    scall_u64(u64GasHi, u64GasLo,
    addrPtr,
    inputPtr,
    inputLen,
    resultPtr,
    resultLen) {
        const resultRefArray = this.viewAt(resultPtr, resultLen);
        const callResult = this.ext.call(_long2.default.fromBits(u64GasLo, u64GasHi),
        this.context.address,
        this.copyAddressAt(addrPtr),
        null,
        this.copyAt(inputPtr, inputLen),
        this.copyAddressAt(addrPtr),
        resultRefArray,
        _externalities.CALL_TYPE.StaticCall);

        // TODO: process callResult
        return 1;
    }

    /**
       * Signature: `fn elog(topic_ptr: *const u8, topic_count: u32, data_ptr: *const u8, data_len: u32)`
       */
    elog(topicPtr, topicCount, dataPtr, dataLen) {
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
        throw "Panic in contract";
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
    suicide(addrPtr) {
        this.ext.suicide(this.viewAddressAt(addrPtr));
    }


    /**
       * Signature: `fn coinbase(dest: *mut u8)`
       */
    coinbase(dest) {
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
    blocknumber_u64() {
        const { blocknumber } = this.ext.getEnvInfo();
        this.i64setHi(blocknumber.getHighBits());
        return blocknumber.getLowBits();
    }

    /**
       * Signature: `timestamp() -> i64`
       */
    timestamp_u64() {
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
    }}
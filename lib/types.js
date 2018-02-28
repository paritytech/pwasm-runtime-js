"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Address = exports.H256 = exports.FixedArray = exports.EnvInfo = exports.ActionParams = exports.PARAMS_TYPES = undefined;
var _bn = require("bn.js");var _bn2 = _interopRequireDefault(_bn);
var _long = require("long");var _long2 = _interopRequireDefault(_long);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



const PARAMS_TYPES = exports.PARAMS_TYPES = {
    Embedded: 0,
    Separate: 1 };




class ActionParams {}exports.ActionParams = ActionParams;













class EnvInfo {








    static default() {
        const env = new EnvInfo();
        env.blocknumber = _long2.default.fromNumber(0);
        env.timestamp = _long2.default.fromNumber(0);
        env.author = new Address(new Uint8Array([]));
        env.difficulty = new _bn2.default(0);
        env.gasLimit = new _bn2.default(0);
        env.gasUsed = new _bn2.default(0);
        env.lastHashes = [];
        return env;
    }}exports.EnvInfo = EnvInfo;


class FixedArray {


    constructor(bytes) {
        this.bytes = bytes;
    }

    write(buf, ptr) {
        let into = new Uint8Array(buf, ptr);
        into.set(this.bytes);
    }

    toString() {
        return "0x" + bytesToHex(this.bytes);
    }

    static fromString(hex) {
        return new FixedArray(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer, offset) {
        const copied = new Uint8Array(buffer.slice(offset, offset + 32));
        return new FixedArray(copied);
    }

    static view(buffer, offset) {
        const view = new Uint8Array(buffer, offset, 32);
        return new FixedArray(view);
    }}exports.FixedArray = FixedArray;


class H256 extends FixedArray {
    static fromString(hex) {
        return new H256(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer, offset) {
        const copied = new Uint8Array(buffer.slice(offset, offset + 32));
        return new H256(copied);
    }

    static view(buffer, offset) {
        const view = new Uint8Array(buffer, offset, 32);
        return new H256(view);
    }}exports.H256 = H256;


class Address extends FixedArray {

    static fromString(hex) {
        return new Address(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer, offset) {
        const copied = new Uint8Array(buffer.slice(offset, offset + 20));
        return new Address(copied);
    }

    static view(buffer, offset) {
        const view = new Uint8Array(buffer, offset, 20);
        return new Address(view);
    }}exports.Address = Address;


function bytesToHex(bytes) {
    return Buffer.from(bytes).toString('hex');
}

function hexToBytes(hex) {
    if (!hex) {
        return [];
    }
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    let len = hex.length;
    let res = [];

    for (let i = 0; i < len; i += 2) {
        let byte = parseInt(hex.slice(i, i + 2), 16);

        res.push(byte);
    }
    return res;
}
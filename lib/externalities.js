"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Externalities = exports.CALL_TYPE = exports.CALL_RESULT = exports.CONTRACT_CREATE_RESULT = undefined;

var _bn = require("bn.js");var _bn2 = _interopRequireDefault(_bn);
var _long = require("long");var _long2 = _interopRequireDefault(_long);
var _types = require("./types");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const CONTRACT_CREATE_RESULT = exports.CONTRACT_CREATE_RESULT = {
    Created: 0,
    Reverted: 1,
    Failed: 2 };


const CALL_RESULT = exports.CALL_RESULT = {
    Success: 0,
    Reverted: 1,
    Failed: 2 };


const CALL_TYPE = exports.CALL_TYPE = {
    None: 0,
    Call: 1,
    CallCode: 2,
    DelegateCall: 3,
    StaticCall: 4 };



























class Externalities {








    constructor(params = { envInfo: _types.EnvInfo.default() }) {
        this.storage = new Map();
        this.envInfo = params.envInfo;
        this.calls = [];
        this.creates = [];
        this.logs = [];
    }

    getEnvInfo() {
        return this.envInfo;
    }

    storageAt(key) {
        return this.storage.get(key.toString()) || new _types.H256(new Uint8Array([0, 0, 0, 0]));
    }

    setStorage(key, value) {
        this.storage.set(key.toString(), value);
    }

    create(gas, value, code) {
        this.creates.push({ gas, value, code });
        return CONTRACT_CREATE_RESULT.Failed;
    }
    call(gas, senderAddress, receiveAddress, value,
    data, codeAddress, output, callType) {
        this.calls.push({ gas, senderAddress, receiveAddress, value, data, codeAddress, callType });
        return CALL_RESULT.Failed;
    }

    log(topics, data) {
        this.logs.push({ topics, data });
    }

    exists() {
        throw "not impl";
    }

    existsAndNotNull() {
        throw "not impl";
    }

    originBalance() {
        throw "not impl";
    }
    balance(address) {
        throw "not impl";
    }
    blockhash(number) {
        throw "not impl";
    }
    extcode(address) {
        throw "not impl";
    }

    ret(gas, data, applyState) {
        throw "not impl";
    }

    suicide(refundAddress) {
        throw "not impl";
    }

    depth() {
        throw "not impl";
    }

    incSstoreClears() {
        throw "not impl";
    }
    isStatic() {
        throw "not impl";
    }}exports.Externalities = Externalities;
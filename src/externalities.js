// @flow

import { H256 } from "./types";

export default class Externalities {

    storage: Map<string, H256>;

    constructor() {
        this.storage = new Map();
    }

    storageAt(key: H256): H256 {
        return this.storage.get(key.toString()) || new H256(new Uint8Array([0,0,0,0]));
    }

    setStorage(key: H256, value: H256) {
        // console.log(key.toString());
        this.storage.set(key.toString(), value);
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
    create(gas, value, code, address) {
        throw "not impl";
    }
    call(gas, senderAddress, receiveAddress, value, data, codeAddress, output, callType) {
        throw "not impl";
    }
    extcode(address) {
        throw "not impl";
    }
    log(topics, data) {
        throw "not impl";
    }

    ret(gas, data, applyState) {
        throw "not impl";
    }

    suicide(refundAddress) {
        throw "not impl";
    }

    envInfo() {
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
    }
}

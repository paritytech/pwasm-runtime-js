// @flow

import BigNumber from "bn.js";
import Long from "long";
import { H256, EnvInfo, Address } from "./types";
import type { CallType } from "./types";

type FakeCreate = {
	gas: Long;
	value: BigNumber;
	code: Uint8Array;
	address: Address;
}

type FakeCall = {
    callType: CallType;
	gas: Long;
	senderAddress: Address;
	receiveAddress: Address;
	value: BigNumber;
	data: Uint8Array;
	codeAddress: Address;
}

export default class Externalities {

    storage: Map<string, H256>;
    envInfo: EnvInfo;
    blockhashes: Map<number, H256>;
    calls: Array<FakeCall>;
    creates: Array<FakeCreate>;

    constructor(params : { envInfo: EnvInfo } = { envInfo: EnvInfo.default()}) {
        this.storage = new Map();
        this.envInfo = params.envInfo;
        this.calls = [];
        this.creates = [];
    }

    storageAt(key: H256): H256 {
        return this.storage.get(key.toString()) || new H256(new Uint8Array([0,0,0,0]));
    }

    setStorage(key: H256, value: H256) {
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
    create(gas: Long, value: BigNumber, code: Uint8Array, address: Address) {
        this.creates.push({gas, value, code, address});
    }
    call(gas: Long, senderAddress: Address, receiveAddress: Address, value: BigNumber,
            data: Uint8Array, codeAddress: Address, output: Uint8Array, callType: CallType) {
        this.calls.push({gas, senderAddress, receiveAddress, value, data, codeAddress, callType});
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

    getEnvInfo(): EnvInfo {
        return this.envInfo;
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

// @flow

import type { Schedule } from "./types";
import BigNumber from "bn.js";
import Long from "long";
import { H256, EnvInfo, Address } from "./types";
import schedule from "./schedule";

export const CONTRACT_CREATE_RESULT = {
    Created: (0:0),
    Reverted: (1:1),
    Failed: (2:2),
};

export const CALL_RESULT = {
    Success: (0:0),
    Reverted: (1:1),
    Failed: (2:2),
};

export const CALL_TYPE = {
    None: (0:0),
    Call: (1:1),
    CallCode: (2:2),
    DelegateCall: (3:3),
    StaticCall: (4:4),
};

export type ContractCreateResult = $Values<typeof CONTRACT_CREATE_RESULT>;
export type CallResult = $Values<typeof CALL_RESULT>;
export type CallType = $Values<typeof CALL_TYPE>;

type FakeLogEntry = {
    topics: Array<H256>,
    data: Uint8Array;
}

type FakeCreate = {
    gas: Long;
    value: BigNumber;
    code: Uint8Array;
}

type FakeCall = {
    callType: CallType;
    gas: Long;
    senderAddress: Address;
    receiveAddress: Address;
    value: ?BigNumber;
    data: Uint8Array;
    codeAddress: Address;
}

export class Externalities {

    storage: Map<string, H256>;
    envInfo: EnvInfo;
    blockhashes: Map<string, H256>;
    calls: Array<FakeCall>;
    creates: Array<FakeCreate>;
    logs: Array<FakeLogEntry>;

    constructor({
            envInfo = EnvInfo.default(),
            blockhashes = new Map()
        } : { envInfo: EnvInfo, blockhashes: Map<string, H256> } = {
            envInfo: EnvInfo.default(),
            blockhashes: new Map()}) {
        this.storage = new Map();
        this.envInfo = envInfo;
        this.blockhashes = blockhashes;
        this.calls = [];
        this.creates = [];
        this.logs = [];
    }

    schedule(): Schedule {
        return schedule;
    }

    getEnvInfo(): EnvInfo {
        return this.envInfo;
    }

    storageAt(key: H256): H256 {
        return this.storage.get(key.toString()) || new H256(new Uint8Array([0,0,0,0]));
    }

    setStorage(key: H256, value: H256) {
        this.storage.set(key.toString(), value);
    }

    create(gas: Long, value: BigNumber, code: Uint8Array): ContractCreateResult {
        this.creates.push({gas, value, code});
        return CONTRACT_CREATE_RESULT.Failed;
    }
    call(gas: Long, senderAddress: Address, receiveAddress: Address, value: BigNumber,
            data: Uint8Array, codeAddress: Address, output: Uint8Array, callType: CallType): CallResult {
        this.calls.push({gas, senderAddress, receiveAddress, value, data, codeAddress, callType});
        return CALL_RESULT.Failed;
    }

    log(topics: Array<H256>, data: Uint8Array) {
        this.logs.push({topics, data});
    }

    exists(address: Address) {
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
    blockhash(number: Long): H256 {
        return this.blockhashes.get(number.toString()) || new H256(new Uint8Array([]));
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
    }
}

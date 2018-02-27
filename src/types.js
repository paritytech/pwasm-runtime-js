// @flow
import BigNumber from "bn.js";
import Long from "long";
import type { CallType } from "./externalities";


export const PARAMS_TYPES = {
    Embedded: (0:0),
    Separate: (1:1),
};

type ParamsType = $Values<typeof PARAMS_TYPES>;

export class ActionParams {
    code_address: Address;
    sender: Address;
    origin: Address;
    code_hash: ?H256;
    code: ?Uint8Array;
    data: ?Uint8Array;
    gas: BigNumber;
    gas_price: BigNumber;
    value: BigNumber;
    callType: CallType;
    params_type: ParamsType;
}

export class EnvInfo {
    blocknumber: Long;
    timestamp: Long;
    author: Address;
    difficulty: BigNumber;
    gasLimit: BigNumber;
    lastHashes: Array<H256>;
    gasUsed: BigNumber;

    static default() {
        const env = new EnvInfo();
        env.blocknumber = Long.fromNumber(0);
        env.timestamp = Long.fromNumber(0);
        env.author = new Address(new Uint8Array([]));
        env.difficulty = new BigNumber(0);
        env.gasLimit = new BigNumber(0);
        env.gasUsed = new BigNumber(0);
        env.lastHashes = [];
        return env;
    }
}

export class FixedArray {
    bytes: Uint8Array;

    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    write(buf: ArrayBuffer, ptr: number) {
        let into = new Uint8Array(buf, ptr);
        into.set(this.bytes);
    }

    toString(): string {
        return "0x" + bytesToHex(this.bytes);
    }

    static fromString(hex: string): FixedArray {
        return new FixedArray(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer: ArrayBuffer, offset: number): FixedArray {
        const copied = new Uint8Array(buffer.slice(offset, offset + 32));
        return new FixedArray(copied);
    }

    static view(buffer: ArrayBuffer, offset: number): FixedArray {
        const view = new Uint8Array(buffer, offset, 32);
        return new FixedArray(view);
    }
}

export class H256 extends FixedArray {
    static fromString(hex: string): FixedArray {
        return new H256(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer: ArrayBuffer, offset: number): H256 {
        const copied = new Uint8Array(buffer.slice(offset, offset + 32));
        return new H256(copied);
    }

    static view(buffer: ArrayBuffer, offset: number) {
        const view = new Uint8Array(buffer, offset, 32);
        return new H256(view);
    }
}

export class Address extends FixedArray {

    static fromString(hex: string): Address {
        return new Address(Uint8Array.from(hexToBytes(hex)));
    }

    static copy(buffer: ArrayBuffer, offset: number): Address {
        const copied = new Uint8Array(buffer.slice(offset, offset + 20));
        return new Address(copied);
    }

    static view(buffer: ArrayBuffer, offset: number): Address {
        const view = new Uint8Array(buffer, offset, 20);
        return new Address(view);
    }
}

function bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}

function hexToBytes(hex: string) {
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

// @flow
import BigNumber from "bn.js";

export const CALL_TYPES = {
    None: (0:0),
    Call: (1:1),
    CallCode: (2:2),
    DelegateCall: (3:3),
    StaticCall: (4:4),
};

export const PARAMS_TYPES = {
    Embedded: (0:0),
    Separate: (1:1),
};

type CallType = $Values<typeof CALL_TYPES>;
type ParamsType = $Values<typeof PARAMS_TYPES>;

export class ActionParams {
    code_address: string;
    sender: string;
    origin: string;
    code_hash: ?string;
    code: ?Uint8Array;
    data: ?Uint8Array;
    gas: BigNumber;
    gas_price: BigNumber;
    value: BigNumber;
    callType: CallType;
    params_type: ParamsType;
}

export class H256 {
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

    static fromString(hex: string): H256 {
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

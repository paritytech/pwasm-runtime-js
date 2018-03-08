import { BinaryReader, BinaryReaderState, ExternalKind } from 'wasmparser';

type Imports = {
    memory: {
        limits: {
            initial: number,
            maximum?: number,
        }
    },
    table: {
        limits: {
            initial: number,
            maximum?: number,
        }
    }
}

export function readImports (module: ArrayBuffer): Imports {
    const reader = new BinaryReader();
    let result = {};
    reader.setData(module, 0, module.byteLength);
    while (reader.read()) {
        if (BinaryReaderState.IMPORT_SECTION_ENTRY === reader.state) {
            let imprt = reader.result;
            if (ExternalKind.Table === imprt.kind) {
                result.table = imprt.type;
                continue;
            }
            if (ExternalKind.Memory === imprt.kind) {
                result.memory = imprt.type;
                continue;
            }
        }
    }
    return result;
}

export function bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex: string): Uint8Array {
    if (!hex) {
      return new Uint8Array([]);
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
    return new Uint8Array(res);
}

export function toArrayBuffer(buf: Buffer) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

export function toBuffer(ab: ArrayBuffer) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

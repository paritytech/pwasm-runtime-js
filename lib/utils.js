'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.

readImports = readImports;var _wasmparser = require('wasmparser');function readImports(module) {
    const reader = new _wasmparser.BinaryReader();
    let result = {};
    reader.setData(module, 0, module.byteLength);
    while (reader.read()) {
        if (_wasmparser.BinaryReaderState.IMPORT_SECTION_ENTRY === reader.state) {
            let imprt = reader.result;
            if (_wasmparser.ExternalKind.Table === imprt.kind) {
                result.table = imprt.type;
                continue;
            }
            if (_wasmparser.ExternalKind.Memory === imprt.kind) {
                result.memory = imprt.type;
                continue;
            }
        }
    }
    return result;
}
let imports = {};
imports['./gas_injector'] = require('./gas_injector');

            const bytes = require('fs').readFileSync('./gas-injector/gas_injector_bg.wasm');
            const wasmModule = new WebAssembly.Module(bytes);
            const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
            module.exports = wasmInstance.exports;

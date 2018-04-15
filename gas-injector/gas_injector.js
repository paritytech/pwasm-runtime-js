
            /* tslint:disable */
            var wasm;
            

            
            let cachedUint8Memory = null;
            function getUint8Memory() {
                if (cachedUint8Memory === null ||
                    cachedUint8Memory.buffer !== wasm.memory.buffer)
                    cachedUint8Memory = new Uint8Array(wasm.memory.buffer);
                return cachedUint8Memory;
            }
        
            function passArray8ToWasm(arg) {
                const ptr = wasm.__wbindgen_malloc(arg.byteLength);
                getUint8Memory().set(arg, ptr);
                return [ptr, arg.length];
            }
        
            let cachedUint32Memory = null;
            function getUint32Memory() {
                if (cachedUint32Memory === null ||
                    cachedUint32Memory.buffer !== wasm.memory.buffer)
                    cachedUint32Memory = new Uint32Array(wasm.memory.buffer);
                return cachedUint32Memory;
            }
        
            let cachedGlobalArgumentPtr = null;
            function globalArgumentPtr() {
                if (cachedGlobalArgumentPtr === null)
                    cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
                return cachedGlobalArgumentPtr;
            }
        
            function setGlobalArgument(arg, i) {
                const idx = globalArgumentPtr() / 4 + i;
                getUint32Memory()[idx] = arg;
            }
        
            function getArrayU8FromWasm(ptr, len) {
                const mem = getUint8Memory();
                const slice = mem.slice(ptr, ptr + len);
                return new Uint8Array(slice);
            }
        
            function getGlobalArgument(arg) {
                const idx = globalArgumentPtr() / 4 + arg;
                return getUint32Memory()[idx];
            }
        module.exports.inject_gas = function (arg0, arg1) {
        const [ptr0, len0] = passArray8ToWasm(arg0);
                                setGlobalArgument(len0, 0);
                            const [ptr1, len1] = passArray8ToWasm(arg1);
                                setGlobalArgument(len1, 1);
                            const ret = wasm.inject_gas(ptr0, ptr1);
                
                            const len = getGlobalArgument(0);
                            const realRet = getArrayU8FromWasm(ret, len);
                            wasm.__wbindgen_free(ret, len * 1);
                            return realRet;
                        
            };


                const TextDecoder = require('util').TextDecoder;
            
            let cachedDecoder = new TextDecoder('utf-8');
        
            function getStringFromWasm(ptr, len) {
                return cachedDecoder.decode(getUint8Memory().slice(ptr, ptr + len));
            }
        module.exports.__wbindgen_throw = function(ptr, len) {
                        throw new Error(getStringFromWasm(ptr, len));
                    };

            wasm = require('./gas_injector_bg');
        
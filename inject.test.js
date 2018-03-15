import fs from 'fs';
import { resolve } from 'path';
import { inject_gas_counter } from '.';
import schedule from './src/schedule';

test('inject', async () => {
    let wasm = fs.readFileSync(resolve('./wasm-tests/compiled/alloc.wasm'));
    let result = await inject_gas_counter(wasm, schedule.wasm);
});

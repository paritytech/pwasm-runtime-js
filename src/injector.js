// @flow
import fs from 'fs';
import { resolve } from 'path';

import type { WasmSchedule } from './types';
import TextEncoder from "text-encoding";
import { inject_gas } from "../gas-injector/gas_injector";
/**
 * Returns gas counter to the module
 */
export function inject_gas_counter(contract: ArrayBuffer, schedule: WasmSchedule): ArrayBuffer {

    const scheduleString = JSON.stringify(schedule);
    const scheduleBytes = new TextEncoder.TextEncoder('utf-8').encode(scheduleString);

    // copy result and return buffer
    return inject_gas(new Uint8Array(contract), scheduleBytes);
}

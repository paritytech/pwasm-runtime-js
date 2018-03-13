extern crate parity_wasm;
extern crate wasm_utils;
#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;

use std::os::raw::{c_void};
use std::mem;

#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut c_void, cap: usize) {
    unsafe  {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
}

#[no_mangle]
pub extern "C" fn inject_gas(input_ptr: *const u8, input_len: usize, schedule_json_ptr: *const u8, schedule_json_len: usize) -> *const i32 {
    let input = unsafe { std::slice::from_raw_parts(input_ptr, input_len) };
    let schedule_json_bytes = unsafe { std::slice::from_raw_parts(schedule_json_ptr, schedule_json_len) };
    let mut result = internal::inject_gas(input, schedule_json_bytes);
    let descriptor = vec![result.as_mut_ptr() as i32, result.len() as i32];
    descriptor.as_ptr()
}

mod internal {
    use parity_wasm;
    use serde_json;
    use wasm_utils::{ inject_gas_counter, rules };

    #[derive(Serialize, Deserialize)]
    struct WasmSchedule {
        regular: u32,
        div: u32,
        mul: u32,
        mem: u32,
        static_u256: u32,
        static_address: u32,
        initial_mem: u32,
        grow_mem: u32,
        max_stack_height: u32,
        opcodes_mul: u32,
        opcodes_div: u32,
    }

    pub fn inject_gas(input: &[u8], schedule_json: &[u8]) -> Vec<u8> {
        let module = parity_wasm::deserialize_buffer(input).expect("Error deserialize_buffer");
        let schedule: WasmSchedule = serde_json::from_slice(schedule_json).expect("Error while WasmSchedule deserializing");
        // TODO: use custom Ruleset
        let module_counted = inject_gas_counter(module, &gas_rules(schedule)).expect("Error inject_gas_counter");
        parity_wasm::serialize(module_counted).expect("Error serialize")
    }

    fn gas_rules(wasm_costs: WasmSchedule) -> rules::Set {
	    rules::Set::new(
            wasm_costs.regular,
            {
                let mut vals = ::std::collections::HashMap::with_capacity(8);
                vals.insert(rules::InstructionType::Load, rules::Metering::Fixed(wasm_costs.mem as u32));
                vals.insert(rules::InstructionType::Store, rules::Metering::Fixed(wasm_costs.mem as u32));
                vals.insert(rules::InstructionType::Div, rules::Metering::Fixed(wasm_costs.div as u32));
                vals.insert(rules::InstructionType::Mul, rules::Metering::Fixed(wasm_costs.mul as u32));
                vals
            })
		.with_grow_cost(wasm_costs.grow_mem)
		.with_forbidden_floats()
    }
}

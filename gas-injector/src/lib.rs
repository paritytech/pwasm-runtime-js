#![feature(proc_macro, wasm_custom_section, wasm_import_module, global_allocator)]

extern crate wee_alloc;
extern crate parity_wasm;
extern crate pwasm_utils;
extern crate wasm_bindgen;
#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;

use wasm_bindgen::prelude::*;
use pwasm_utils::{ inject_gas_counter, rules };

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

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

#[wasm_bindgen]
pub fn inject_gas(input: Vec<u8>, schedule_json: Vec<u8>) -> Vec<u8> {
    let module = parity_wasm::deserialize_buffer(&input).expect("Error deserialize_buffer");
    let schedule: WasmSchedule = serde_json::from_slice(&schedule_json).expect("Error while WasmSchedule deserializing");
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

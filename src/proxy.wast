(module
  (type (;0;) (func))
  (type (;1;) (func (param i32 i32)))
  (type (;2;) (func (result i32)))
  (type (;3;) (func (result i64)))
  (import "env" "timestamp_i64" (func (;0;) (type 0)))
  (func (;1;) (type 1) (param i32 i32)
    get_local 0
    set_global 0
    get_local 1
    set_global 1)
  (func (;2;) (type 2) (result i32)
    get_global 0)
  (func (;3;) (type 2) (result i32)
    get_global 1)
  (func (;4;) (type 3) (result i64)
    i64.const 0)
  (global (;0;) (mut i32) (i32.const 0))
  (global (;1;) (mut i32) (i32.const 0))
  (export "i64set" (func 1))
  (export "i64getHi" (func 2))
  (export "i64getLo" (func 3))
  (export "timestamp" (func 4)))

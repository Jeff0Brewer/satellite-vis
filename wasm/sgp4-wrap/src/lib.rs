use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Prediction {
  pub position: [f64; 3],
  pub velocity: [f64; 3],
}

#[wasm_bindgen]
pub fn elements_from_tle(name: &str, line1: &str, line2: &str) -> JsValue {
    let elements: sgp4::Elements = sgp4::Elements::from_tle(
        Some(name.to_string()),
        line1.as_bytes(),
        line2.as_bytes(),
    ).unwrap();
  JsValue::from_serde(&elements).unwrap()
}

#[wasm_bindgen]
pub fn propagate(elements: &JsValue, t: f64) -> JsValue {
  let elements: sgp4::Elements = elements.into_serde().unwrap();
  let constants = sgp4::Constants::from_elements(&elements).unwrap();
  let prediction: sgp4::Prediction = constants.propagate(t).unwrap();
  JsValue::from_serde(&prediction).unwrap()
}

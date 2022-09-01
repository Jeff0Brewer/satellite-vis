extern crate eventual;
use eventual::Timer;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Sgp4Loop {
    pos_buf: Vec<f32>,
    element_groups: Vec<sgp4::Elements>
}

#[wasm_bindgen]
impl Sgp4Loop {
    pub fn new() -> Sgp4Loop {
        let pos_buf = Vec::new();
        let element_groups = Vec::new();
        Sgp4Loop {
            pos_buf,
            element_groups
        }
    }

    pub fn pos_buf_ptr(&self) -> *const f32 {
        self.pos_buf.as_ptr()
    }

    pub fn set_data(mut self, data: &str) {
        self.pos_buf = Vec::new();
        self.element_groups = Vec::new();
        let tles = data.split("\n\n");
        for text in tles {
            let lines = text.split("\n");
            let tle: Vec<&str> = lines.collect();
            let elements: sgp4::Elements = sgp4::Elements::from_tle(
                Some(tle[0].to_string()),
                tle[1].as_bytes(),
                tle[2].as_bytes()
            ).unwrap();
            self.element_groups.push(elements);
            for _ in 0..3 {
                self.pos_buf.push(0.0);
            }
        }
    }

    pub fn propagate(mut self, t: f64) {
        let mut i = 0;
        for elements in &self.element_groups {
            let constants: sgp4::Constants = sgp4::Constants::from_elements(&elements).unwrap();
            let prediction: sgp4::Prediction = constants.propagate(t).unwrap();
            self.pos_buf[i*3] = prediction.position[0] as f32;
            self.pos_buf[i*3+1] = prediction.position[1] as f32;
            self.pos_buf[i*3+2] = prediction.position[2] as f32;
            i = i + 1;
        }
    }

    //pub fn start_loop(mut self, data: &str, t_start: f64, t_speed: f64) {
    //    self.pos_buf = Vec::new();
    //    let mut constant_groups = Vec::new();
    //    let tles = data.split("\n\n");
    //    for text in tles {
    //        let lines = text.split("\n");
    //        let tle: Vec<&str> = lines.collect();
    //        let elements: sgp4::Elements = sgp4::Elements::from_tle(
    //            Some(tle[0].to_string()),
    //            tle[1].as_bytes(),
    //            tle[2].as_bytes()
    //        ).unwrap();
    //        constant_groups.push(sgp4::Constants::from_elements(&elements).unwrap());
    //        self.pos_buf.push(0.0);
    //    }

    //    const TICKRATE: f64 = 16.0;
    //    let mut t = t_start;
    //    let timer = Timer::new();
    //    let ticks = timer.interval_ms(16).iter();
    //    let mut i = 0;
    //    for _ in ticks {
    //        for constants in &constant_groups {
    //            let prediction: sgp4::Prediction = constants.propagate(t).unwrap();
    //            self.pos_buf[i*3] = prediction.position[0] as f32;
    //            self.pos_buf[i*3+1] = prediction.position[1] as f32;
    //            self.pos_buf[i*3+2] = prediction.position[2] as f32;
    //        }
    //        t = t + TICKRATE/(60000.0);
    //        i = i + 1;
    //    }
    //}
}

pub fn sgp4_loop(data: &str, t_start: f64, t_speed: f64) {
    let mut constant_groups = Vec::new();
    let tles = data.split("\n\n");
    for text in tles {
        let lines = text.split("\n");
        let tle: Vec<&str> = lines.collect();
        let elements: sgp4::Elements = sgp4::Elements::from_tle(
            Some(tle[0].to_string()),
            tle[1].as_bytes(),
            tle[2].as_bytes()
        ).unwrap();
        constant_groups.push(sgp4::Constants::from_elements(&elements).unwrap());
    }
}


#[derive(Serialize, Deserialize)]
pub struct Prediction {
  pub position: [f64; 3],
  pub velocity: [f64; 3],
}

pub fn propagate_tles(data: &str, t: f64) -> JsValue {
    let mut result = "".to_owned();
    let mut tles = data.split("\n\n");
    loop {
        match tles.next() {
            Some(x) => {
                let lines = x.split("\n");
                let tle: Vec<&str> = lines.collect();
                let elements: sgp4::Elements = sgp4::Elements::from_tle(
                    Some(tle[0].to_string()),
                    tle[1].as_bytes(),
                    tle[2].as_bytes(),
                ).unwrap();
                let constants = sgp4::Constants::from_elements(&elements).unwrap();
                let prediction: sgp4::Prediction = constants.propagate(t).unwrap();
                for i in 0..3 {
                    result.push_str(&prediction.position[i].to_string());
                    result.push_str(&"\n");
                }
            },
            None => { break }
        }
    }
    JsValue::from_str(&result)
}

pub fn elements_from_tle(name: &str, line1: &str, line2: &str) -> JsValue {
    let elements: sgp4::Elements = sgp4::Elements::from_tle(
        Some(name.to_string()),
        line1.as_bytes(),
        line2.as_bytes(),
    ).unwrap();
  JsValue::from_serde(&elements).unwrap()
}

pub fn propagate(elements: &JsValue, t: f64) -> JsValue {
  let elements: sgp4::Elements = elements.into_serde().unwrap();
  let constants = sgp4::Constants::from_elements(&elements).unwrap();
  let prediction: sgp4::Prediction = constants.propagate(t).unwrap();
  JsValue::from_serde(&prediction).unwrap()
}

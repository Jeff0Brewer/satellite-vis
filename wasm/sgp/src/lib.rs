use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Sgp4Calc {
    pos_buf: Vec<f32>,
    element_groups: Vec<sgp4::Elements>
}

#[wasm_bindgen]
impl Sgp4Calc {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sgp4Calc {
        let pos_buf = Vec::new();
        let element_groups = Vec::new();
        Sgp4Calc {
            pos_buf,
            element_groups
        }
    }

    pub fn set_data(&mut self, data: &str) {
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

    pub fn propagate(&mut self, t: f64) {
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

    pub fn pos_buf_ptr(&self) -> *const f32 {
        self.pos_buf.as_ptr()
    }
}

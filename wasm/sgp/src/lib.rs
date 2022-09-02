extern crate console_error_panic_hook;
use wasm_bindgen::prelude::*;
use substring::Substring;

const MIN_PER_YEAR: f64 = 525600.0;
const MIN_PER_DAY: f64 = 1440.0;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Sgp4Calc {
    pos_buf: Vec<f32>,
    element_groups: Vec<sgp4::Elements>,
    epoch_years: Vec<i16>,
    epoch_days: Vec<f64>,
    curr_year: i16,
    curr_day: f64
}

#[wasm_bindgen]
impl Sgp4Calc {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sgp4Calc {
        console_error_panic_hook::set_once();
        Sgp4Calc {
            pos_buf: Vec::new(),
            element_groups: Vec::new(),
            epoch_years: Vec::new(),
            epoch_days: Vec::new(),
            curr_year: 0,
            curr_day: 0.0
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

            let year = tle[1].substring(18, 20).parse::<i16>().unwrap();
            let day = tle[1].substring(20, 32).parse::<f64>().unwrap();
            self.epoch_years.push(year);
            self.epoch_days.push(day);
        }
    }

    pub fn propagate(&mut self, year: i16, day: f64) {
        let mut i = 0;
        for elements in &self.element_groups {
            let t = ((year - self.epoch_years[i]) as f64)*MIN_PER_YEAR + (day - self.epoch_days[i])*MIN_PER_DAY;
            let constants: sgp4::Constants = sgp4::Constants::from_elements(&elements).unwrap();
            if let Ok(prediction) = constants.propagate(t) {
                self.pos_buf[i*3] = prediction.position[0] as f32;
                self.pos_buf[i*3+1] = prediction.position[1] as f32;
                self.pos_buf[i*3+2] = prediction.position[2] as f32;
            }
            i = i + 1;
        }
        self.curr_year = year;
        self.curr_day = day;
    }

    pub fn pos_buf_ptr(&self) -> *const f32 {
        self.pos_buf.as_ptr()
    }

    pub fn curr_year_ptr(&self) -> *const i16 {
        &self.curr_year
    }

    pub fn curr_day_ptr(&self) -> *const f64 {
        &self.curr_day
    }
}

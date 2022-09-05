extern crate console_error_panic_hook;
extern crate wee_alloc;
use wasm_bindgen::prelude::*;
use substring::Substring;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const MIN_PER_YEAR: f64 = 525600.0;
const MIN_PER_DAY: f64 = 1440.0;

#[wasm_bindgen]
pub struct Sgp4Calc {
    element_groups: Vec<sgp4::Elements>,
    epoch_years: Vec<i16>,
    epoch_days: Vec<f64>
}

#[wasm_bindgen]
impl Sgp4Calc {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Sgp4Calc {
        console_error_panic_hook::set_once();
        Sgp4Calc {
            element_groups: Vec::new(),
            epoch_years: Vec::new(),
            epoch_days: Vec::new()
        }
    }

    pub fn set_data(&mut self, data: &str) {
        self.element_groups = Vec::new();
        self.epoch_years = Vec::new();
        self.epoch_days = Vec::new();
        let tles = data.split("\n\n");
        for text in tles {
            let tle: Vec<&str> = text.split("\n").collect();

            let elements: sgp4::Elements = sgp4::Elements::from_tle(
                Some(tle[0].to_string()),
                tle[1].as_bytes(),
                tle[2].as_bytes()
            ).unwrap();
            self.element_groups.push(elements);

            let year = tle[1].substring(18, 20).parse::<i16>().unwrap();
            let day = tle[1].substring(20, 32).parse::<f64>().unwrap();
            self.epoch_years.push(year);
            self.epoch_days.push(day);
        }
    }

    pub fn propagate(&self, memory: &mut [f32], epoch_year: i16, epoch_day: f64) {
        let mut mem_i = 0;
        let mut tle_i = 0;
        for elements in &self.element_groups {
            let constants: sgp4::Constants = sgp4::Constants::from_elements(&elements).unwrap();
            let t = ((epoch_year - self.epoch_years[tle_i]) as f64)*MIN_PER_YEAR + (epoch_day - self.epoch_days[tle_i])*MIN_PER_DAY;
            tle_i = tle_i + 1;

            if let Ok(prediction) = constants.propagate(t) {
                for float in prediction.position.iter() {
                    memory[mem_i] = *float as f32;
                    mem_i = mem_i + 1;
                }
            }
        }
    }
}

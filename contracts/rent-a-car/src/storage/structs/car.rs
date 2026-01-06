use soroban_sdk::{contracttype};

use crate::storage::types::car_status::CarStatus;

#[derive(Clone)]
#[contracttype]
pub struct Car {
    pub price_per_day: i128,
    pub car_status: CarStatus,
}
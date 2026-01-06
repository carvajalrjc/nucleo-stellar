use soroban_sdk::{contracttype};

#[derive(Clone)]
#[contracttype]
pub struct Rental {
    pub total_days_to_rent: u32,
    pub amount: i128,
}
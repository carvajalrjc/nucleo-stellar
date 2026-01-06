use soroban_sdk::{Address, Env};

use crate::storage::types::car_status::CarStatus;

pub trait RentACarContractTrait {
    fn __constructor(env: &Env, admin: Address, token: Address);
    fn get_admin(env: &Env) -> Address;
    fn add_car(env: &Env, owner: Address, price_per_day: i128);
    fn get_car_status(env: &Env, owner: Address) -> CarStatus;
    fn rental(env: &Env, renter: Address, owner: Address, total_days_to_rent: u32, amount: i128);
    fn remove_car(env: &Env, owner: Address);
}
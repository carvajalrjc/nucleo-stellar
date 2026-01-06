use soroban_sdk::{contract, contractimpl, Address, Env};
use crate::{interfaces::contract::RentACarContractTrait, storage::{admin::{read_admin, write_admin}, car::{read_car, remove_car, write_car}, rental::write_rental, structs::{car::Car, rental::Rental}, token::write_token, types::car_status::CarStatus}};

#[contract]
pub struct RentACarContract;

#[contractimpl]
impl RentACarContractTrait for RentACarContract {
    fn __constructor(env: &Env, admin: Address, token: Address) {
        write_admin(env, &admin);
        write_token(env, &token);
    }

    fn get_admin(env: &Env) -> Address {
        read_admin(env)
    }

    fn add_car(env: &Env, owner: Address, price_per_day: i128) {
        let car = Car {
            price_per_day,
            car_status: CarStatus::Available,
        };

        write_car(env, &owner, &car);
    }

    fn get_car_status(env: &Env, owner: Address) -> CarStatus {
        let car = read_car(env, &owner);

        car.car_status
    }

    fn rental(env: &Env, renter: Address, owner: Address, total_days_to_rent: u32, amount: i128) {
        let mut car = read_car(env, &owner);

        car.car_status = CarStatus::Rented;

        let rental = Rental {
            total_days_to_rent,
            amount,
        };

        write_car(env, &owner, &car);
        write_rental(env, &renter, &owner, &rental);
    }

    fn remove_car(env: &Env, owner: Address) {
        remove_car(env, &owner);
    }
}
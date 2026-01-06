use soroban_sdk::{testutils::Address as _, Address};
use crate::{storage::{car::read_car, rental::read_rental, types::car_status::CarStatus}, tests::config::contract::ContractTest};

#[test]
pub fn test_rental_car_successfully() {
    let ContractTest { env, contract, .. } = ContractTest::setup();

    let owner = Address::generate(&env);
    let renter = Address::generate(&env);
    let price_per_day = 1500_i128;
    let total_days = 3;
    let amount = 4500_i128;

    contract.add_car(&owner, &price_per_day);

    contract.rental(&renter, &owner, &total_days, &amount);

    let car = env.as_contract(&contract.address, || read_car(&env, &owner));
    assert_eq!(car.car_status, CarStatus::Rented);

    let rental = env.as_contract(&contract.address, || read_rental(&env, &renter, &owner));
    assert_eq!(rental.total_days_to_rent, total_days);
    assert_eq!(rental.amount, amount);
}
use soroban_sdk::{testutils::Address as _, Address};
use crate::{storage::{car::has_car}, tests::config::contract::ContractTest};

#[test]
pub fn test_remove_car_deletes_from_storage() {
    let ContractTest { env, contract, .. } = ContractTest::setup();

    let owner = Address::generate(&env);
    let price_per_day = 1500_i128;

    contract.add_car(&owner, &price_per_day);
    assert!(env.as_contract(&contract.address, || {
        has_car(&env, &owner)
    }));

    contract.remove_car(&owner);
    assert!(!env.as_contract(&contract.address, || {
        has_car(&env, &owner)
    }));
}
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};
use crate::interfaces::contract::RentACarContractTrait;

#[contract]
pub struct RentACarContract;

pub const ADMIN_KEY: &Symbol = &symbol_short!("ADMIN");
pub const TOKEN_KEY: &Symbol = &symbol_short!("TOKEN");

#[contractimpl]
impl RentACarContractTrait for RentACarContract {
    fn __constructor(env: &Env, admin: Address, token: Address) {
        env.storage().instance().set(ADMIN_KEY, &admin);
        env.storage().instance().set(TOKEN_KEY, &token);
    }

    fn initialize(env: &Env, admin: Address, token: Address) {
        env.storage().instance().set(ADMIN_KEY, &admin);
        env.storage().instance().set(TOKEN_KEY, &token);
    }
}
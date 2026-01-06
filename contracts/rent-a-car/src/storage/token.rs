use soroban_sdk::{Address, Env};

use crate::storage::types::storage::DataKey;

pub(crate) fn read_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Token).unwrap()
}

pub(crate) fn write_token(env: &Env, token: &Address) {
    env.storage()
        .instance()
        .set(&DataKey::Token, &token);
}
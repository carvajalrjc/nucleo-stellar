use soroban_sdk::{testutils::Address as _, token, Address, Env};
use crate::{contract::RentACarContractClient, RentACarContract};
use crate::tests::config::utils::create_token_contract;

pub struct ContractTest<'a> {
    pub env: Env,
    pub contract: RentACarContractClient<'a>,
    pub admin: Address,
    pub token: (token::Client<'a>, token::StellarAssetClient<'a>, Address),
}

impl<'a> ContractTest<'a> {
    pub fn setup() -> Self {
        let env = Env::default();

        let admin = Address::generate(&env);
        let token_issuer = Address::generate(&env);

        let (token_client, token_admin) = create_token_contract(&env, &token_issuer);

        let contract_id = env.register(RentACarContract, (&admin, &token_client.address));
        let contract = RentACarContractClient::new(&env, &contract_id);

        ContractTest {
            env,
            contract,
            admin,
            token: (token_client, token_admin, token_issuer),
        }
    }
}
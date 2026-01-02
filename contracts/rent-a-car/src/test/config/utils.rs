use soroban_sdk::{token, Address, Env};

pub(crate) fn create_token_contract<'a>(
    e: &Env,
    admin: &Address,
) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let addr = e.register_stellar_asset_contract_v2(admin.clone());

    (
        token::Client::new(e, &addr.address()),
        token::StellarAssetClient::new(e, &addr.address()),
    )
}
use crate::tests::config::contract::ContractTest;

#[test]
pub fn test_initialize() {
    let ContractTest { contract, admin, .. } = ContractTest::setup();
		
    let contract_admin = contract.get_admin();

    assert_eq!(admin, contract_admin);
}

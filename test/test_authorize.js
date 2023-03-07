const DataAnchor = artifacts.require("DataAnchor");
const DataAuthorize = artifacts.require("DataAuthorize");

let dapp_anchor;
let dapp_authorize;
const hash_test = "0xb954f19eb78c5fad948a0aaa283f174132c6a73f4639ba32b8bcbb2e5fb3c7ab";
const recipient = "0x0000000000000000000000000000000000000000";

async function getAuthorizationInfo(_dapp_authorize, _owner, _hash, _idx) {
  let results = await _dapp_authorize.getAuthorizationForOwnerWithHashByIdx(_owner, _hash, _idx);
  console.log("results: ", results);
  console.log("time: ", results[5].toNumber());
  console.log("validity: ", results[6].toNumber());
}

contract("DataAnchor", function (accounts) {
  it("deply anchor dapp", async function () {
    console.log("\r\n>>>>> deply anchor dapp...");
    dapp_anchor = await DataAnchor.new()
    console.log("dapp_anchor.address: ", dapp_anchor.address);
    assert(dapp_anchor);
  });

  it("deply authorization dapp", async function () {
    console.log("\r\n>>>>> deply authorization dapp...");
    dapp_authorize = await DataAuthorize.new()
    console.log("dapp_authorize.address: ", dapp_authorize.address);
    assert(dapp_authorize);
  });

  it("make a anchor", async function () {
    let exist= await dapp_anchor.anchorHasExisted(accounts[0], hash_test);
    assert(!exist, "anchor has existed!");

    let tx = await dapp_anchor.addAnchor(0, "sha256", hash_test, web3.utils.asciiToHex("content"), { from: accounts[0] });
    console.log("tx.logs: ", tx.logs);
    let event = tx.logs.find(e => e.event === 'AnchorAdded').args
    let idx= event.idx;
    console.log("idx: ", idx.toNumber());

    exist= await dapp_anchor.anchorHasExisted(accounts[0], hash_test);
    assert(exist, "anchoring fail!");
  });
  
  it("make a authorization", async function () {
    let exist= await dapp_authorize.authorizationHasExisted(accounts[0], recipient, hash_test);
    assert(!exist, "authorization has existed!");

    let validity= Math.trunc(new Date().getTime()/1000) + (60*60);
    console.log("validity: ", validity);
    let tx = await dapp_authorize.addAuthorization(dapp_anchor.address, hash_test, recipient, "test for authorizing", validity, { from: accounts[0] });
    console.log("tx.logs: ", tx.logs);
    let event = tx.logs.find(e => e.event === 'AuthorizationAdded').args
    let authIdx= event.authIdx;
    console.log("authIdx: ", authIdx.toNumber());

    console.log("getAuthorizationInfo (new)>>");
    getAuthorizationInfo(dapp_authorize, accounts[0], hash_test, authIdx);

    exist= await dapp_authorize.authorizationHasExisted(accounts[0], recipient, hash_test);
    assert(exist, "authorizing fail!");    
  });

  it("revoke a authorization", async function () {
    let exist= await dapp_authorize.authorizationHasExisted(accounts[0], recipient, hash_test);
    assert(exist, "authorization hasn't existed!");

    let valid= await dapp_authorize.authorizationValidated(accounts[0], recipient, hash_test);
    assert(exist, "authorization isn't validated!");

    let tx = await dapp_authorize.revokeAuthorization(hash_test, recipient, "test for revoking", { from: accounts[0] });
    console.log("tx.logs: ", tx.logs);
    let event = tx.logs.find(e => e.event === 'AuthorizationUpdated').args
    let authIdx= event.authIdx;
    console.log("authIdx: ", authIdx.toNumber());

    console.log("getAuthorizationInfo (revoke)>>");
    getAuthorizationInfo(dapp_authorize, accounts[0], hash_test, authIdx);

    valid= await dapp_authorize.authorizationValidated(accounts[0], recipient, hash_test);
    assert(!valid, "revoking fail!");
  });

});

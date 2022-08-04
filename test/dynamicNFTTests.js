const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi, bytecode } = require("usingtellor/artifacts/contracts/TellorPlayground.sol/TellorPlayground.json")
const h = require("usingtellor/test/helpers/helpers.js");

describe("Tellor", function() {
  let dynamicNFT;
  let tellorOracle;
  let accounts;

  const abiCoder = new ethers.utils.AbiCoder
  const queryDataArgs = abiCoder.encode(['string', 'string'], ['eth', 'usd'])
  const queryData = abiCoder.encode(['string', 'bytes'], ['SpotPrice', queryDataArgs])
  const queryId = ethers.utils.keccak256(queryData)

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    let TellorOracle = await ethers.getContractFactory(abi, bytecode);
    tellorOracle = await TellorOracle.deploy();
    await tellorOracle.deployed();

    let DynamicNFT = await ethers.getContractFactory("DynamicNFT");
    dynamicNFT = await DynamicNFT.deploy("Tellor Dynamic NFT","TDNFT",queryId,tellorOracle.address);
    await dynamicNFT.deployed();
  });

  it("Test mintToken", async function() {
    const mockValue = h.tob32(100) ;
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,mockValue,0,queryData);
    h.advanceTime(86400)
    await dynamicNFT.mintToken(accounts[1].address)
    expect(await dynamicNFT.getStartPrice(1) == mockValue, "start Price should be correct")
    expect(await dynamicNFT.supply() == 1, "supply should be correct")
    expect(await dynamicNFT.ownerOf(1) == accounts[1].address)
    expect(await dynamicNFT.tokenURI(1) == await dynamicNFT.metadataURI_up(), "url should be set")
  });
  it("Test updateURI", async function() {
    const mockValue = h.tob32(100)
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,mockValue,0,queryData);
    h.advanceTime(86400)
    await dynamicNFT.mintToken(accounts[1].address)
    await dynamicNFT.updateURI(1);
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,h.tob32(50),0,queryData);
    h.advanceTime(86400)
    await dynamicNFT.updateURI(1);
    expect(await dynamicNFT.tokenURI(1) == await dynamicNFT.metadataURI_down(), "url should be set")
    // submit value takes 4 args : queryId, value, nonce and queryData
    await tellorOracle.submitValue(queryId,h.tob32(150),0,queryData);
    h.advanceTime(86400)
    await dynamicNFT.updateURI(1);
    expect(await dynamicNFT.tokenURI(1) == await dynamicNFT.metadataURI_up(), "url should be set")
    //0x6e5122118ce52cc9b97c359c1f174a3c21c71d810f7addce3484cc28e0be0f29
    //1000 //0x0000000000000000000000000000000000000000000000000000000003130303
    //500 //0x0000000000000000000000000000000000000000000000000000000000035303
    //0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000953706f745072696365000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000003726963000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037573640000000000000000000000000000000000000000000000000000000000
  });
});

// SPDX-License-Identifier: none
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "usingtellor/contracts/UsingTellor.sol";

//"Tellor Dynamic NFT","TD",0x6e5122118ce52cc9b97c359c1f174a3c21c71d810f7addce3484cc28e0be0f29,0x7B8AC044ebce66aCdF14197E8De38C1Cc802dB4A
contract DynamicNFT is ERC721, ERC721URIStorage, UsingTellor {

    //storage
    bytes32 public tellorID;
    uint256 public supply;
    mapping(uint256 => uint256) startPrices;
    string constant public metadataURI_up = "ipfs://QmXstMbf412MGNnHxzAwSA1RC5vq8VbLF6MbvmZTzJ6BVj";
    string constant public metadataURI_down = "ipfs://QmSNcAhadvadkHgukeXSmgmX6Q1G5yQXEVbAkiRGkvhbYK";

    constructor(string memory tokenName,
        string memory symbol,
        bytes32 _tellorID,
        address payable _tellorAddress)
         ERC721(tokenName, symbol) 
         UsingTellor(_tellorAddress)
         {
             tellorID = _tellorID;
    }

    function mintToken(address _owner) public returns (uint256 _id){
        supply++;
        _id = supply;
        (bool ifRetrieve, bytes memory _value,) = getDataBefore(tellorID, block.timestamp - 10 seconds);
        require(ifRetrieve);
        uint256 _uintValue = abi.decode(_value, (uint256));
        startPrices[_id] = _uintValue;
        _safeMint(_owner, _id);
        _setTokenURI(_id, metadataURI_up);
    }

    function updateURI(uint256 _id) external{
        (bool ifRetrieve, bytes memory _value,) = getDataBefore(tellorID, block.timestamp - 10);
        if (!ifRetrieve) return;
        uint256 _uintValue = abi.decode(_value, (uint256));
        if(_uintValue >= startPrices[_id]){
            _setTokenURI(_id, metadataURI_up);
        }else{
            _setTokenURI(_id, metadataURI_down);
        }
    }

    function getStartPrice(uint256 _id) external view returns(uint256){
        return startPrices[_id];
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

/**
  {
    "path": "RedCrest.png",
    "hash": "QmR2zHcNhbM9ps7VQDoa5dHeHZnXzfYYGCma4nvfe6J6V7",
    "size": 124701
  },
  {
    "path": "GreenCrest.png",
    "hash": "QmU1gkk1PiPZm4ewryfgHZ1r3fyzvTrv12UJRJiDmEHju3",
    "size": 178254
  }
]
*/
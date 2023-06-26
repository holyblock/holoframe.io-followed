// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import {ClonesUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./HoloCollection.sol";

// Factory contract for creating HoloCollection contracts
contract HoloFactory {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private atContract;

  /// Address for implementation of SingleEditionMintable to clone
  address public implementation;

  /// Initializes factory with address of implementation logic
  /// @param _implementation SingleEditionMintable logic implementation contract to clone
  constructor(address _implementation) {
    implementation = _implementation;
  }

  /// Creates a new collection contract as a factory with a deterministic address
  /// Important: None of these fields (except the Url fields with the same hash) can be changed after calling
  /// @param _name Name of edition, used in the title as "$NAME NUMBER/TOTAL"
  /// @param _symbol Symbol of the new token contract
  /// @param _originProjAddr Address of origin project this derivative is based off of
  /// @param _maxSupply Total number of NFTs in the collection
  /// @param _royaltyBPS BPS of the royalty set on the contract. Can be 0 for no royalty.
  function createCollection(
    string memory _name,
    string memory _symbol,
    address _originProjAddr,
    uint256 _maxSupply,
    uint256 _royaltyBPS
  ) external returns (uint256) {
    uint256 newId = atContract.current();
    address newContract = ClonesUpgradeable.cloneDeterministic(
      implementation,
      bytes32(newId)
    );
    HoloCollection(newContract).initialize(
      _name,
      _symbol,
      msg.sender,
      _originProjAddr,
      _maxSupply,
      _royaltyBPS
    );
    emit CreatedCollection(newId, msg.sender, _maxSupply, newContract);
    // Returns the ID of the recently created minting contract
    // Also increments for the next contract creation call
    atContract.increment();
    return newId;
  }

  /// Get edition given the created ID
  /// @param collectionId id of collection to get contract for
  /// @return SingleEditionMintable Collection NFT contract
  function getCollectionAtId(uint256 collectionId)
    external
    view
    returns (HoloCollection)
  {
    return
      HoloCollection(
        ClonesUpgradeable.predictDeterministicAddress(
          implementation,
          bytes32(collectionId),
          address(this)
        )
      );
  }

  /// Emitted when a collection is created reserving the corresponding token IDs.
  /// @param collectionId ID of newly created collection
  event CreatedCollection(
    uint256 indexed collectionId,
    address indexed creator,
    uint256 collectionSize,
    address collectionContractAddress
  );
}
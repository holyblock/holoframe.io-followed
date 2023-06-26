// contracts/Solidity.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// V1 contract for native or derivative Holo collections
contract HoloCollection is ERC721URIStorageUpgradeable, OwnableUpgradeable {
  // using Counters for Counters.Counter;
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;
  event PriceChanged(uint256 amount);

  bool public saleIsActive;
  // Total size of collection that can be minted
  uint256 public maxSupply;
  // Price for minting an item in the collection
  uint256 public mintPrice;
  // Address of origin project if this is a derivative
  address public originAddr;
  // Addresses allowed to mint edition
  mapping(address => bool) allowedMinters;

  // Royalty amount in bps
  uint256 royaltyBPS;
  
  constructor () {}
  
  /**
    @param _owner User that owns and can mint the edition, gets royalty and sales payouts and can update the base url if needed.
    @param _originAddr Address of origin project this derivative is based off of
    @param _name Name of edition, used in the title as "$NAME NUMBER/TOTAL"
    @param _symbol Symbol of the new token contract
    @param _maxSupply Total number of NFTs in the collection
    @param _royaltyBPS BPS of the royalty set on the contract. Can be 0 for no royalty.
    @dev Function to create a new edition. Can only be called by the allowed creator
      Sets the only allowed minter to the address that creates/owns the edition.
      This can be re-assigned or updated later
  */
  function initialize(
    string memory _name, 
    string memory _symbol,
    address _owner,
    address _originAddr,
    uint256 _maxSupply,
    uint256 _royaltyBPS
  ) public initializer {
    __ERC721_init(_name, _symbol);
    __Ownable_init();
    
    // Set ownership to original sender of contract call
    transferOwnership(_owner);
    originAddr = _originAddr;
    maxSupply = _maxSupply;
    royaltyBPS = _royaltyBPS;
    saleIsActive = false;
    mintPrice = 0;
  }

  /// @dev returns the number of minted tokens within the collection
  function totalSupply() public view returns (uint256) {
    return _tokenIds.current();
  }

  function mint(address to, uint256 originTokenId, string memory tokenURI)
    public
    payable
    returns (uint256)
  {
    require(saleIsActive, "Sale must be active to mint");
    require(_isAllowedToMint(), "Needs to be an allowed minter");
    require(totalSupply() + 1 <= maxSupply, "Purchase would exceed max supply");
    require(mintPrice <= msg.value, "Ether value sent is not correct");

    // Mint derivative NFT
    if (originAddr != address(0)) {
      require(
        ERC721URIStorageUpgradeable(originAddr).ownerOf(originTokenId) == msg.sender,
        "Must own the original NFT to mint derivative"
      );
      require(
        originTokenId >= 0 && originTokenId < maxSupply,
        "Must include a valid token ID"
      );

      // Execute mint
      _mint(to, originTokenId);
      // Set URI to metadata
      _setTokenURI(originTokenId, tokenURI);
      // Increment token Ids to keep track of total supply
      _tokenIds.increment();

      return originTokenId;
    } else {
      // Mint native NFT
      _tokenIds.increment();
      uint256 newItemId = _tokenIds.current(); // Generate new token Id
      _mint(to, newItemId);

      // Set URI to metadata
      _setTokenURI(newItemId, tokenURI);
      return newItemId;
    }
  }

  /*
  * Pause sale if active, make active if paused
  */
  function flipSaleState() public onlyOwner {
    saleIsActive = !saleIsActive;
  }

  /**
    @param _maxSupply max number of mintable items in collection
    @dev Set new max supply
    */
  function setMaxSupply(uint _maxSupply) public onlyOwner {
    maxSupply = _maxSupply;
  }

  /**
    @param _mintPrice default to 0
    @dev This sets a simple ETH sales price
    */
  function setMintPrice(uint256 _mintPrice) external onlyOwner {
    mintPrice = _mintPrice;
    // emit PriceChanged(salePrice);
  }

  /**
    @param minter address to set approved minting status for
    @param allowed boolean if that address is allowed to mint
    @dev Sets the approved minting status of the given address.
          This requires that msg.sender is the owner of the given collection id.
          If the ZeroAddress (address(0x0)) is set as a minter,
          anyone will be allowed to mint.
          This setup is similar to setApprovalForAll in the ERC721 spec.
    */
  function setApprovedMinter(address minter, bool allowed) public onlyOwner {
    allowedMinters[minter] = allowed;
  }

  /**
    @param minters addresses to set approved minting status for
    @dev Sets the approved minting status of the given addresses to true.
          This requires that msg.sender is the owner of the given collection id.
    */
  function setApprovedMinters(address[] memory minters) public onlyOwner {
    for (uint i=0; i<minters.length; i++) {
      allowedMinters[minters[i]] = true;
    }
  }

  /**
    @dev This helper function checks if the msg.sender is allowed to mint the
        given edition id.
    */
  function _isAllowedToMint() internal view returns (bool) {
    if (owner() == msg.sender) {
      return true;
    }
    if (allowedMinters[address(0x0)]) {
      return true;
    }
    return allowedMinters[msg.sender];
  }

  /**
    @dev This withdraws ETH from the contract to the contract owner.
    */
  function withdraw() external onlyOwner {
    // No need for gas limit to trusted address.
    AddressUpgradeable.sendValue(payable(owner()), address(this).balance);
  }

  /**
    Simple override for owner interface.
    */
  function owner()
    public
    view
    override(OwnableUpgradeable)
    returns (address)
  {
    return super.owner();
  }

  /**
    @param tokenId Token ID to burn
    User burn function for token id 
    */
  function burn(uint256 tokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved");
    _burn(tokenId);
  }
}
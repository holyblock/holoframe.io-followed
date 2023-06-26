// contracts/Solidity.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Contract for minting honorary 1-of-1 NFTs
contract HoloHonorary is ERC721URIStorage, ERC721Enumerable, Pausable, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor(string memory name) ERC721(name, "HOLO") {}

  function mint(address to, string memory tokenURI)
    public
    onlyOwner
    payable
    returns (uint256)
  {
    // Generate new Id and execute mint
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(to, newItemId);

    // Set URI to metadata
    _setTokenURI(newItemId, tokenURI);
    return newItemId;
  }

  /**
   * OVERRIDES
   */

  /**
   * override(ERC721, ERC721Enumerable, ERC721Pausable) 
   * here you're overriding _beforeTokenTransfer method of
   * three Base classes namely ERC721, ERC721Enumerable, ERC721Pausable
   * */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal
    override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }
  
  /**
   * override(ERC721, ERC721Enumerable) -> here you're specifying only two base classes ERC721, ERC721Enumerable
   * */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  /**
   * override(ERC721, ERC721URIStorage) -> here you're specifying only two base classes ERC721, ERC721URIStorage
   * */
  function _burn(uint256 tokenId)
    internal
    override(ERC721, ERC721URIStorage)
  {
    return super._burn(tokenId);
  }

  /**
   * override(ERC721, ERC721URIStorage) -> here you're specifying only two base classes ERC721, ERC721URIStorage
   * */
  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  // function withDraw() public onlyOwner {
  //   uint balance = address(this).balance;
  //   msg.sender.transfer(balance);
  // }
}
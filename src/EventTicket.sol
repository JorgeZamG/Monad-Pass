// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EventTicket is ERC721URIStorage, Ownable, ReentrancyGuard {
    struct EventInfo {
        string name;
        string location;
        uint256 date;
        uint256 price;
        uint256 maxSupply;
        uint256 totalMinted;
        bool active;
    }

    EventInfo public eventInfo;

    uint256 private _nextTokenId;
    mapping(uint256 => bool) public isCheckedIn;
    mapping(uint256 => bool) public isSoulbound;
    mapping(address => uint256) public ticketOf;

    address public organizer;

    event TicketPurchased(address indexed buyer, uint256 indexed tokenId);
    event CheckedIn(address indexed attendee, uint256 indexed tokenId);
    event Withdrawn(address indexed organizer, uint256 amount);

    error EventNotActive();
    error SoldOut();
    error AlreadyHasTicket();
    error IncorrectPayment();
    error NotTicketOwner();
    error AlreadyCheckedIn();
    error SoulboundToken();
    error NotOrganizer();

    constructor(
        string memory _name,
        string memory _location,
        uint256 _date,
        uint256 _price,
        uint256 _maxSupply,
        address _organizer,
        string memory /* _baseTokenURI */
    ) ERC721(_name, "TICKET") Ownable(_organizer) {
        eventInfo = EventInfo({
            name: _name,
            location: _location,
            date: _date,
            price: _price,
            maxSupply: _maxSupply,
            totalMinted: 0,
            active: true
        });
        organizer = _organizer;
    }

    function purchaseTicket(string memory tokenURI) external payable nonReentrant {
        if (!eventInfo.active) revert EventNotActive();
        if (eventInfo.totalMinted >= eventInfo.maxSupply) revert SoldOut();
        if (ticketOf[msg.sender] != 0) revert AlreadyHasTicket();
        if (msg.value != eventInfo.price) revert IncorrectPayment();

        uint256 tokenId = ++_nextTokenId;
        eventInfo.totalMinted++;
        ticketOf[msg.sender] = tokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit TicketPurchased(msg.sender, tokenId);
    }

    function checkIn(uint256 tokenId) external {
        if (msg.sender != organizer) revert NotOrganizer();
        if (!_exists(tokenId)) revert NotTicketOwner();
        if (isCheckedIn[tokenId]) revert AlreadyCheckedIn();

        isCheckedIn[tokenId] = true;
        isSoulbound[tokenId] = true;

        emit CheckedIn(ownerOf(tokenId), tokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && isSoulbound[tokenId]) {
            revert SoulboundToken();
        }
        return super._update(to, tokenId, auth);
    }

    function withdraw() external {
        if (msg.sender != organizer) revert NotOrganizer();
        uint256 balance = address(this).balance;
        (bool ok, ) = organizer.call{value: balance}("");
        require(ok, "Transfer failed");
        emit Withdrawn(organizer, balance);
    }

    function availableTickets() external view returns (uint256) {
        return eventInfo.maxSupply - eventInfo.totalMinted;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}

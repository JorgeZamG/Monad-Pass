// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

contract TicketFactory {
    struct EventRecord {
        address contractAddress;
        address organizer;
        string name;
        uint256 date;
        bool active;
    }

    EventRecord[] public events;
    mapping(address => uint256[]) public organizerEvents;

    event EventCreated(
        address indexed organizer,
        address indexed contractAddress,
        uint256 indexed eventIndex,
        string name
    );

    function createEvent(
        string memory _name,
        string memory _location,
        uint256 _date,
        uint256 _price,
        uint256 _maxSupply,
        string memory _baseTokenURI
    ) external returns (address) {
        EventTicket newEvent = new EventTicket(
            _name,
            _location,
            _date,
            _price,
            _maxSupply,
            msg.sender,
            _baseTokenURI
        );

        uint256 idx = events.length;
        events.push(
            EventRecord({
                contractAddress: address(newEvent),
                organizer: msg.sender,
                name: _name,
                date: _date,
                active: true
            })
        );

        organizerEvents[msg.sender].push(idx);

        emit EventCreated(msg.sender, address(newEvent), idx, _name);
        return address(newEvent);
    }

    function getEventCount() external view returns (uint256) {
        return events.length;
    }

    function getOrganizerEvents(address organizer) external view returns (uint256[] memory) {
        return organizerEvents[organizer];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EventTicket.sol";

contract EventTicketTest is Test {
    EventTicket ticket;
    address organizer = address(0xA);
    address buyer = address(0xB);
    address buyer2 = address(0xC);

    uint256 constant PRICE = 0.01 ether;

    function setUp() public {
        vm.prank(organizer);
        ticket = new EventTicket(
            "MonadConf 2025",
            "Guadalajara",
            block.timestamp + 7 days,
            PRICE,
            100,
            organizer,
            "ipfs://QmXxx/"
        );
    }

    function test_PurchaseTicket() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        ticket.purchaseTicket{value: PRICE}("ipfs://QmXxx/1.json");
        assertEq(ticket.balanceOf(buyer), 1);
    }

    function test_RevertIfAlreadyHasTicket() public {
        vm.deal(buyer, 1 ether);
        vm.startPrank(buyer);
        ticket.purchaseTicket{value: PRICE}("ipfs://QmXxx/1.json");
        vm.expectRevert(EventTicket.AlreadyHasTicket.selector);
        ticket.purchaseTicket{value: PRICE}("ipfs://QmXxx/2.json");
        vm.stopPrank();
    }

    function test_CheckIn_MakesSoulbound() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        ticket.purchaseTicket{value: PRICE}("ipfs://QmXxx/1.json");

        vm.prank(organizer);
        ticket.checkIn(1);

        assertTrue(ticket.isSoulbound(1));
        assertTrue(ticket.isCheckedIn(1));
    }

    function test_RevertTransferAfterCheckIn() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        ticket.purchaseTicket{value: PRICE}("ipfs://QmXxx/1.json");

        vm.prank(organizer);
        ticket.checkIn(1);

        vm.prank(buyer);
        vm.expectRevert(EventTicket.SoulboundToken.selector);
        ticket.transferFrom(buyer, buyer2, 1);
    }

    function test_Withdraw() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        ticket.purchaseTicket{value: PRICE}("ipfs://QmXxx/1.json");

        uint256 beforeBal = organizer.balance;
        vm.prank(organizer);
        ticket.withdraw();

        assertEq(organizer.balance, beforeBal + PRICE);
    }
}

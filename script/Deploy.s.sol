// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/TicketFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        TicketFactory factory = new TicketFactory();
        console.log("TicketFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}

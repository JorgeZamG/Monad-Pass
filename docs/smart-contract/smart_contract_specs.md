# Smart Contract Specs

# Smart Contract Specs — Web3 Ticketing Platform
> Stack: Solidity ^0.8.20 · Foundry · Monad Testnet · OpenZeppelin · IPFS/Pinata

---

## Visión general

El sistema se compone de **dos contratos principales** que trabajan juntos:

1. `TicketFactory.sol` — Crea y administra eventos. Cada evento despliega su propio contrato de tickets.
2. `EventTicket.sol` — ERC-721 con lógica de transferencia condicional y conversión a Soulbound Token (SBT) post check-in.

La relación entre ellos es como un **molde y sus piezas**: la Factory es el molde, y cada EventTicket es una pieza única por evento.

---

## Paso 1 — Setup del proyecto con Foundry

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Iniciar proyecto
forge init web3-ticketing
cd web3-ticketing

# Instalar dependencias
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std

# Estructura esperada
web3-ticketing/
├── src/
│   ├── TicketFactory.sol
│   └── EventTicket.sol
├── test/
│   ├── TicketFactory.t.sol
│   └── EventTicket.t.sol
├── script/
│   └── Deploy.s.sol
└── foundry.toml
```

### foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
remappings = [
  "@openzeppelin/=lib/openzeppelin-contracts/"
]

[rpc_endpoints]
monad_testnet = "https://testnet-rpc.monad.xyz"

[etherscan]
monad_testnet = { key = "placeholder", url = "https://testnet-explorer.monad.xyz/api" }
```

---

## Paso 2 — Contrato `EventTicket.sol`

Este es el **corazón del sistema**. Hereda de ERC-721 y agrega la lógica de soulbound.

### Responsabilidades
- Mintear tickets como NFTs al momento de compra.
- Bloquear transferencias una vez que el asistente hace check-in (`soulbound = true`).
- Almacenar metadata del ticket en IPFS.
- Emitir evento `CheckedIn` que el frontend escucha en tiempo real.

### Especificación completa

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EventTicket is ERC721URIStorage, Ownable, ReentrancyGuard {

    // ─── Estado del evento ────────────────────────────────────────────
    struct EventInfo {
        string  name;
        string  location;
        uint256 date;           // Unix timestamp
        uint256 price;          // en wei
        uint256 maxSupply;
        uint256 totalMinted;
        bool    active;
    }

    EventInfo public eventInfo;

    // ─── Estado de los tickets ────────────────────────────────────────
    uint256 private _nextTokenId;
    mapping(uint256 => bool) public isCheckedIn;   // tokenId → checked in
    mapping(uint256 => bool) public isSoulbound;   // tokenId → no transferible
    mapping(address => uint256) public ticketOf;   // wallet → tokenId (1 por wallet)

    // ─── Fondos ───────────────────────────────────────────────────────
    address public organizer;

    // ─── Eventos ──────────────────────────────────────────────────────
    event TicketPurchased(address indexed buyer, uint256 indexed tokenId);
    event CheckedIn(address indexed attendee, uint256 indexed tokenId);
    event Withdrawn(address indexed organizer, uint256 amount);

    // ─── Errores custom (más baratos que require + string) ────────────
    error EventNotActive();
    error SoldOut();
    error AlreadyHasTicket();
    error IncorrectPayment();
    error NotTicketOwner();
    error AlreadyCheckedIn();
    error SoulboundToken();
    error NotOrganizer();

    // ─── Constructor ──────────────────────────────────────────────────
    constructor(
        string memory _name,
        string memory _location,
        uint256 _date,
        uint256 _price,
        uint256 _maxSupply,
        address _organizer,
        string memory _baseTokenURI
    ) ERC721(_name, "TICKET") Ownable(_organizer) {
        eventInfo = EventInfo({
            name:        _name,
            location:    _location,
            date:        _date,
            price:       _price,
            maxSupply:   _maxSupply,
            totalMinted: 0,
            active:      true
        });
        organizer = _organizer;
    }

    // ─── Compra de ticket ─────────────────────────────────────────────
    function purchaseTicket(string memory tokenURI) 
        external 
        payable 
        nonReentrant 
    {
        if (!eventInfo.active)                        revert EventNotActive();
        if (eventInfo.totalMinted >= eventInfo.maxSupply) revert SoldOut();
        if (ticketOf[msg.sender] != 0)                revert AlreadyHasTicket();
        if (msg.value != eventInfo.price)             revert IncorrectPayment();

        uint256 tokenId = ++_nextTokenId;
        eventInfo.totalMinted++;
        ticketOf[msg.sender] = tokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit TicketPurchased(msg.sender, tokenId);
    }

    // ─── Check-in (solo organizador) ──────────────────────────────────
    function checkIn(uint256 tokenId) external {
        if (msg.sender != organizer) revert NotOrganizer();
        if (!_exists(tokenId))       revert NotTicketOwner(); // token inexistente
        if (isCheckedIn[tokenId])    revert AlreadyCheckedIn();

        isCheckedIn[tokenId] = true;
        isSoulbound[tokenId] = true;

        emit CheckedIn(ownerOf(tokenId), tokenId);
    }

    // ─── Bloquear transferencias si es soulbound ──────────────────────
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Permitir mint (from = address(0)) pero bloquear transfers post check-in
        if (from != address(0) && isSoulbound[tokenId]) {
            revert SoulboundToken();
        }
        return super._update(to, tokenId, auth);
    }

    // ─── Retiro de fondos ─────────────────────────────────────────────
    function withdraw() external {
        if (msg.sender != organizer) revert NotOrganizer();
        uint256 balance = address(this).balance;
        (bool ok,) = organizer.call{value: balance}("");
        require(ok, "Transfer failed");
        emit Withdrawn(organizer, balance);
    }

    // ─── Helpers de vista ─────────────────────────────────────────────
    function availableTickets() external view returns (uint256) {
        return eventInfo.maxSupply - eventInfo.totalMinted;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
```

### Variables de estado — resumen

| Variable | Tipo | Descripción |
|---|---|---|
| `eventInfo` | struct | Datos del evento |
| `isCheckedIn` | mapping | ¿El token hizo check-in? |
| `isSoulbound` | mapping | ¿El token es intransferible? |
| `ticketOf` | mapping | Una wallet = un ticket máximo |

---

## Paso 3 — Contrato `TicketFactory.sol`

La Factory actúa como **registro central** de todos los eventos. El frontend consulta aquí para listar eventos.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

contract TicketFactory {

    struct EventRecord {
        address contractAddress;
        address organizer;
        string  name;
        uint256 date;
        bool    active;
    }

    EventRecord[] public events;
    mapping(address => uint256[]) public organizerEvents; // organizer → índices

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
        events.push(EventRecord({
            contractAddress: address(newEvent),
            organizer:       msg.sender,
            name:            _name,
            date:            _date,
            active:          true
        }));

        organizerEvents[msg.sender].push(idx);

        emit EventCreated(msg.sender, address(newEvent), idx, _name);
        return address(newEvent);
    }

    function getEventCount() external view returns (uint256) {
        return events.length;
    }

    function getOrganizerEvents(address organizer) 
        external view returns (uint256[] memory) 
    {
        return organizerEvents[organizer];
    }
}
```

---

## Paso 4 — Tests con Foundry

```solidity
// test/EventTicket.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EventTicket.sol";

contract EventTicketTest is Test {
    EventTicket ticket;
    address organizer = address(0xA);
    address buyer     = address(0xB);
    address buyer2    = address(0xC);

    uint256 PRICE = 0.01 ether;

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

        uint256 before = organizer.balance;
        vm.prank(organizer);
        ticket.withdraw();
        assertEq(organizer.balance, before + PRICE);
    }
}
```

### Comandos para correr tests

```bash
# Correr todos los tests
forge test -vvv

# Correr un test específico
forge test --match-test test_CheckIn_MakesSoulbound -vvv

# Ver gas usado
forge test --gas-report
```

---

## Paso 5 — Deploy a Monad Testnet

```solidity
// script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
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
```

```bash
# Variables de entorno necesarias
export PRIVATE_KEY=0x...
export MONAD_RPC=https://testnet-rpc.monad.xyz

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $MONAD_RPC \
  --broadcast \
  --verify \
  -vvvv

# Guardar la dirección del contrato deployado para el frontend
# NEXT_PUBLIC_FACTORY_ADDRESS=0x...
```

---

## Paso 6 — Metadata en IPFS (Pinata)

Cada ticket necesita un JSON que cumpla el estándar ERC-721 metadata.

```json
{
  "name": "MonadConf 2025 — Ticket #1",
  "description": "Boleto oficial para MonadConf 2025 en Guadalajara. Después del check-in se convierte en prueba de asistencia no transferible.",
  "image": "ipfs://QmXxx.../ticket-cover.png",
  "attributes": [
    { "trait_type": "Event",    "value": "MonadConf 2025" },
    { "trait_type": "Location", "value": "Guadalajara" },
    { "trait_type": "Date",     "value": "2025-09-15" },
    { "trait_type": "Status",   "value": "Active" },
    { "trait_type": "Type",     "value": "General Admission" }
  ]
}
```

```bash
# Subir imagen y JSON a Pinata via CLI
npm install -g @pinata/cli
pinata auth
pinata upload ./ticket-cover.png
pinata upload ./metadata/1.json
# Guardar CID → ipfs://Qm.../1.json → usar como tokenURI al mintear
```

---

## Checklist de entrega del contrato

- [ ] `EventTicket.sol` compila sin warnings
- [ ] Todos los tests pasan (`forge test`)
- [ ] `TicketFactory.sol` deployado en Monad Testnet
- [ ] Address del factory guardada en `.env` del frontend
- [ ] ABI exportado: `forge build` → `out/EventTicket.sol/EventTicket.json`
- [ ] Al menos un evento creado en testnet para demostrar en el hackathon
- [ ] Metadata subida a IPFS y CID verificable en gateway público

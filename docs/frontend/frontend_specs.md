# Frontend Specs — Web3 Ticketing Platform
> Stack: Next.js 14 · RainbowKit · Wagmi v2 · Viem · TailwindCSS · Pinata · QR Code

---

## Visión general

El frontend tiene **dos roles distintos** en la misma app, diferenciados por la wallet conectada:

- **Organizador** — la wallet que desplegó el evento ve el dashboard de gestión.
- **Asistente** — cualquier otra wallet ve la vista de compra y su ticket.

Piénsalo como un **aeropuerto**: el mismo edificio tiene mostrador de check-in (organizador) y sala de espera con boarding pass (asistente). La wallet es el pasaporte que decide a cuál área entras.

---

## Paso 1 — Setup del proyecto

```bash
npx create-next-app@latest web3-ticketing-frontend --typescript --tailwind --app
cd web3-ticketing-frontend

# Dependencias Web3
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query

# Utilidades
npm install qrcode.react qrcode
npm install @pinata/sdk
npm install lucide-react
npm install date-fns

# Dev
npm install -D @types/qrcode
```

### Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx              # Providers globales
│   ├── page.tsx                # Home: lista de eventos
│   ├── create/
│   │   └── page.tsx            # Crear evento (solo organizador)
│   ├── event/
│   │   └── [address]/
│   │       ├── page.tsx        # Vista pública del evento
│   │       ├── buy/
│   │       │   └── page.tsx    # Comprar ticket
│   │       └── manage/
│   │           └── page.tsx    # Dashboard organizador + check-in
│   └── my-tickets/
│       └── page.tsx            # Mis tickets (asistente)
├── components/
│   ├── ui/
│   │   ├── ConnectButton.tsx
│   │   ├── EventCard.tsx
│   │   └── TicketCard.tsx
│   ├── organizer/
│   │   ├── CreateEventForm.tsx
│   │   ├── CheckInScanner.tsx
│   │   └── SalesDashboard.tsx
│   └── attendee/
│       ├── BuyTicketButton.tsx
│       └── TicketQR.tsx
├── hooks/
│   ├── useTicketFactory.ts
│   ├── useEventTicket.ts
│   └── useIsOrganizer.ts
├── lib/
│   ├── wagmi.ts                # Config de wagmi + chains
│   ├── contracts.ts            # ABIs + addresses
│   └── pinata.ts               # Upload de metadata
└── types/
    └── index.ts
```

---

## Paso 2 — Configuración de Wagmi + RainbowKit

```typescript
// src/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
  testnet: true,
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Web3 Ticketing',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains: [monadTestnet],
  ssr: true,
})
```

```typescript
// src/app/layout.tsx
'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi'

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
```

---

## Paso 3 — ABIs y contratos

```typescript
// src/lib/contracts.ts

export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`

export const FACTORY_ABI = [
  {
    name: 'createEvent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_name',         type: 'string'  },
      { name: '_location',     type: 'string'  },
      { name: '_date',         type: 'uint256' },
      { name: '_price',        type: 'uint256' },
      { name: '_maxSupply',    type: 'uint256' },
      { name: '_baseTokenURI', type: 'string'  },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'events',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'contractAddress', type: 'address' },
      { name: 'organizer',       type: 'address' },
      { name: 'name',            type: 'string'  },
      { name: 'date',            type: 'uint256' },
      { name: 'active',          type: 'bool'    },
    ],
  },
  {
    name: 'getEventCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'EventCreated',
    type: 'event',
    inputs: [
      { name: 'organizer',        type: 'address', indexed: true },
      { name: 'contractAddress',  type: 'address', indexed: true },
      { name: 'eventIndex',       type: 'uint256', indexed: true },
      { name: 'name',             type: 'string',  indexed: false },
    ],
  },
] as const

export const EVENT_TICKET_ABI = [
  {
    name: 'purchaseTicket',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'tokenURI', type: 'string' }],
    outputs: [],
  },
  {
    name: 'checkIn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'eventInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'name',         type: 'string'  },
      { name: 'location',     type: 'string'  },
      { name: 'date',         type: 'uint256' },
      { name: 'price',        type: 'uint256' },
      { name: 'maxSupply',    type: 'uint256' },
      { name: 'totalMinted',  type: 'uint256' },
      { name: 'active',       type: 'bool'    },
    ],
  },
  {
    name: 'ticketOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'isCheckedIn',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'isSoulbound',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'availableTickets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'organizer',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'TicketPurchased',
    type: 'event',
    inputs: [
      { name: 'buyer',   type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
  {
    name: 'CheckedIn',
    type: 'event',
    inputs: [
      { name: 'attendee', type: 'address', indexed: true },
      { name: 'tokenId',  type: 'uint256', indexed: true },
    ],
  },
] as const
```

---

## Paso 4 — Hooks personalizados

### Hook: datos del evento

```typescript
// src/hooks/useEventTicket.ts
import { useReadContracts } from 'wagmi'
import { EVENT_TICKET_ABI } from '@/lib/contracts'

export function useEventTicket(eventAddress: `0x${string}`) {
  const contract = { address: eventAddress, abi: EVENT_TICKET_ABI }

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: 'eventInfo' },
      { ...contract, functionName: 'availableTickets' },
      { ...contract, functionName: 'organizer' },
    ],
  })

  const eventInfo  = data?.[0]?.result
  const available  = data?.[1]?.result
  const organizer  = data?.[2]?.result

  return { eventInfo, available, organizer, isLoading, refetch }
}
```

### Hook: ticket del usuario conectado

```typescript
// src/hooks/useMyTicket.ts
import { useAccount, useReadContracts } from 'wagmi'
import { EVENT_TICKET_ABI } from '@/lib/contracts'

export function useMyTicket(eventAddress: `0x${string}`) {
  const { address } = useAccount()
  const contract = { address: eventAddress, abi: EVENT_TICKET_ABI }

  const { data: tokenIdData } = useReadContracts({
    contracts: [{ ...contract, functionName: 'ticketOf', args: [address!] }],
    query: { enabled: !!address },
  })

  const tokenId = tokenIdData?.[0]?.result

  const { data: statusData, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: 'isCheckedIn', args: [tokenId!] },
      { ...contract, functionName: 'isSoulbound',  args: [tokenId!] },
      { ...contract, functionName: 'tokenURI',     args: [tokenId!] },
    ],
    query: { enabled: !!tokenId && tokenId > 0n },
  })

  return {
    tokenId,
    hasTicket:   tokenId !== undefined && tokenId > 0n,
    isCheckedIn: statusData?.[0]?.result ?? false,
    isSoulbound: statusData?.[1]?.result ?? false,
    tokenURI:    statusData?.[2]?.result,
    refetch,
  }
}
```

### Hook: ¿es organizador?

```typescript
// src/hooks/useIsOrganizer.ts
import { useAccount, useReadContract } from 'wagmi'
import { EVENT_TICKET_ABI } from '@/lib/contracts'

export function useIsOrganizer(eventAddress: `0x${string}`) {
  const { address } = useAccount()
  const { data: organizer } = useReadContract({
    address: eventAddress,
    abi: EVENT_TICKET_ABI,
    functionName: 'organizer',
  })
  return organizer?.toLowerCase() === address?.toLowerCase()
}
```

---

## Paso 5 — Componentes clave

### BuyTicketButton

```typescript
// src/components/attendee/BuyTicketButton.tsx
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { EVENT_TICKET_ABI } from '@/lib/contracts'
import { uploadTicketMetadata } from '@/lib/pinata'

interface Props {
  eventAddress: `0x${string}`
  price: bigint
  eventName: string
  onSuccess: () => void
}

export function BuyTicketButton({ eventAddress, price, eventName, onSuccess }: Props) {
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  async function handleBuy() {
    // 1. Subir metadata a IPFS
    const tokenURI = await uploadTicketMetadata(eventName)

    // 2. Llamar al contrato
    writeContract({
      address: eventAddress,
      abi: EVENT_TICKET_ABI,
      functionName: 'purchaseTicket',
      args: [tokenURI],
      value: price,
    })
  }

  if (isSuccess) {
    onSuccess()
    return <p className="text-green-600">¡Ticket comprado! 🎉</p>
  }

  return (
    <button
      onClick={handleBuy}
      disabled={isPending || isConfirming}
      className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium 
                 disabled:opacity-50 hover:bg-purple-700 transition-colors"
    >
      {isPending    ? 'Confirmando en wallet...' :
       isConfirming ? 'Procesando on-chain...'   :
                      `Comprar ticket — ${Number(price) / 1e18} MON`}
    </button>
  )
}
```

### TicketQR — el boarding pass del asistente

```typescript
// src/components/attendee/TicketQR.tsx
'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useAccount } from 'wagmi'

interface Props {
  tokenId: bigint
  eventAddress: string
  isSoulbound: boolean
  isCheckedIn: boolean
}

export function TicketQR({ tokenId, eventAddress, isSoulbound, isCheckedIn }: Props) {
  const { address } = useAccount()

  // El QR encode: eventAddress:tokenId:walletAddress
  const qrValue = `${eventAddress}:${tokenId.toString()}:${address}`

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
      <div className={`p-4 rounded-xl ${isCheckedIn ? 'bg-blue-50' : 'bg-white'}`}>
        <QRCodeSVG
          value={qrValue}
          size={200}
          level="H"
          includeMargin
        />
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-400 font-mono break-all">{qrValue}</p>
        <div className="mt-2">
          {isCheckedIn ? (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              ✓ Check-in realizado — Prueba de asistencia
            </span>
          ) : (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Ticket activo — Transferible
            </span>
          )}
        </div>
      </div>

      {isSoulbound && (
        <p className="text-xs text-gray-400 text-center">
          Este ticket ya no puede ser transferido. Es parte de tu identidad on-chain.
        </p>
      )}
    </div>
  )
}
```

### CheckInScanner — pantalla del organizador en puerta

```typescript
// src/components/organizer/CheckInScanner.tsx
'use client'

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EVENT_TICKET_ABI } from '@/lib/contracts'

interface Props {
  eventAddress: `0x${string}`
}

export function CheckInScanner({ eventAddress }: Props) {
  const [tokenId, setTokenId] = useState('')
  const [scannedQR, setScannedQR] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Parsear el QR: eventAddress:tokenId:walletAddress
  function parseQR(raw: string) {
    const parts = raw.split(':')
    if (parts.length >= 2) setTokenId(parts[1])
  }

  function handleCheckIn() {
    if (!tokenId) return
    writeContract({
      address: eventAddress,
      abi: EVENT_TICKET_ABI,
      functionName: 'checkIn',
      args: [BigInt(tokenId)],
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Check-in en puerta</h2>

      {/* Input manual de tokenId (en MVP; luego reemplazar con cámara) */}
      <input
        type="text"
        placeholder="Pegar contenido del QR o Token ID"
        value={scannedQR}
        onChange={e => { setScannedQR(e.target.value); parseQR(e.target.value) }}
        className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
      />

      {tokenId && (
        <p className="text-sm text-gray-600">Token ID detectado: <strong>#{tokenId}</strong></p>
      )}

      <button
        onClick={handleCheckIn}
        disabled={!tokenId || isPending || isLoading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-medium
                   disabled:opacity-50 hover:bg-green-700 transition-colors"
      >
        {isPending || isLoading ? 'Procesando...' : 'Confirmar check-in on-chain'}
      </button>

      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-medium">✓ Check-in confirmado</p>
          <p className="text-green-500 text-sm">El ticket ahora es Soulbound</p>
        </div>
      )}
    </div>
  )
}
```

---

## Paso 6 — Upload de metadata a Pinata

```typescript
// src/lib/pinata.ts

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY!

export async function uploadTicketMetadata(
  eventName: string,
  tokenId?: number
): Promise<string> {
  const metadata = {
    name: `${eventName} — Ticket${tokenId ? ` #${tokenId}` : ''}`,
    description: `Boleto oficial para ${eventName}. Al hacer check-in se convierte en Soulbound Token — prueba de asistencia on-chain.`,
    image: `${PINATA_GATEWAY}/QmTicketCoverCID`,  // CID de la imagen del evento
    attributes: [
      { trait_type: 'Event',  value: eventName },
      { trait_type: 'Status', value: 'Active'  },
      { trait_type: 'Type',   value: 'General Admission' },
    ],
  }

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `ticket-${Date.now()}.json` },
    }),
  })

  const data = await res.json()
  return `ipfs://${data.IpfsHash}`
}
```

---

## Paso 7 — Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_WALLETCONNECT_ID=tu_project_id_de_walletconnect
NEXT_PUBLIC_FACTORY_ADDRESS=0x_direccion_del_factory_en_monad
NEXT_PUBLIC_PINATA_JWT=eyJhbGci...
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
```

---

## Flujo de páginas — mapa de navegación

```
/                           → Lista de eventos activos
├── /create                 → Formulario crear evento (requiere wallet)
└── /event/[address]        → Vista pública del evento
    ├── /event/[address]/buy    → Compra de ticket
    ├── /event/[address]/manage → Dashboard organizador (solo si es organizer)
    └── /my-tickets             → Mis tickets + QR (requiere wallet)
```

### Lógica de acceso

```typescript
// Dentro de /event/[address]/manage/page.tsx
const isOrganizer = useIsOrganizer(params.address)

if (!isOrganizer) redirect(`/event/${params.address}`)
```

---

## Checklist de entrega del frontend

- [ ] `wagmi.ts` configurado con Monad Testnet chain
- [ ] `FACTORY_ADDRESS` en `.env.local` apuntando al contrato deployado
- [ ] Página de lista de eventos muestra eventos reales de la Factory
- [ ] Flujo de compra funciona end-to-end (wallet → pago → NFT minteado)
- [ ] Ticket QR visible en `/my-tickets` después de comprar
- [ ] Check-in funciona desde `/event/[address]/manage`
- [ ] Estado soulbound se refleja visualmente en el ticket del asistente
- [ ] Deploy en Vercel con variables de entorno configuradas
- [ ] Demo funcional en Monad Testnet con al menos 1 evento y 1 ticket comprado

---

## Comandos rápidos de referencia

```bash
# Dev local
npm run dev

# Build para producción
npm run build

# Deploy en Vercel
vercel --prod

# Verificar que el contrato responde
cast call $FACTORY_ADDRESS "getEventCount()" --rpc-url https://testnet-rpc.monad.xyz
```

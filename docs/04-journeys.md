# Bitcoin Map — Journeys

## What a Journey Is

A journey is a curated, annotated path through the codebase that follows a real process. It's a sequence of **stops**, where each stop is a specific function or code block in a specific file, with a human-written annotation explaining what's happening.

Journeys are the primary teaching tool. The 3D city exists to make journeys spatial and memorable.

## Journey Definition Format

```typescript
interface JourneyStop {
  file: string;          // relative path in Bitcoin Core repo
  function: string;      // function name (used to locate in parsed data)
  line_hint?: number;    // approximate line number (fallback if function not found)
  annotation: string;    // 1-3 sentences: what happens here and why
  details?: string;      // optional longer explanation, shown on expand
}

interface Journey {
  id: string;
  name: string;          // "Life of a Transaction"
  description: string;   // one-line summary
  color: string;         // trail color on the map
  stops: JourneyStop[];
}
```

## How Journeys Work in the App

1. All journey paths are always visible on the city ground as faint colored lines.
2. User clicks a journey path (or selects from sidebar) to activate it.
3. A glowing dot appears at stop 1. Camera flies there. Code panel opens showing the function with the annotation.
4. User clicks "Next" (or presses arrow key) to advance. The dot animates along the road to the next building. Camera follows.
5. At any time, user can click away to explore freely. The journey pauses — the dot stays where it is, the path remains highlighted.
6. User can resume by clicking the dot or pressing a "Resume" button.
7. Journey ends at the last stop with a summary panel.

## Planned Journeys

### 1. Life of a Transaction

The most important journey. Follows a transaction from the moment it arrives over the network to when it's confirmed in a block.

**Stops:**
1. `net.cpp` → `CConnman::SocketHandler` — Raw bytes arrive on a TCP socket from a peer
2. `net.cpp` → `CConnman::ProcessMessages` — Bytes are deserialized into a network message
3. `net_processing.cpp` → `ProcessMessage` — Message is identified as `tx`
4. `net_processing.cpp` → `ProcessOrphanTx` — Check if this tx was something we were waiting for
5. `validation.cpp` → `AcceptToMemoryPool` — The big gate: validate the transaction against consensus rules
6. `txmempool.cpp` → `CTxMemPool::addUnchecked` — Transaction enters the mempool
7. `net_processing.cpp` → `RelayTransaction` — Tell other peers about this transaction
8. `miner.cpp` → `BlockAssembler::addPackageTxs` — Miner selects this tx for a block template
9. `validation.cpp` → `ConnectBlock` — Block containing this tx is validated and connected to the chain
10. `txmempool.cpp` → `CTxMemPool::removeForBlock` — Transaction is removed from mempool (it's confirmed now)

### 2. Block Validation

What happens when a new block arrives from the network.

**Stops:**
1. `net_processing.cpp` → `ProcessMessage("block")` — Block message received
2. `validation.cpp` → `ProcessNewBlock` — Entry point for block processing
3. `validation.cpp` → `CheckBlock` — Basic structural checks (size, merkle root, etc.)
4. `validation.cpp` → `AcceptBlock` — Check block header, store to disk
5. `validation.cpp` → `ConnectTip` — This block extends our best chain
6. `validation.cpp` → `ConnectBlock` — Execute every transaction, update UTXO set
7. `validation.cpp` → `UpdateTip` — Update chain state, log the new tip
8. `net_processing.cpp` → `PeerManagerImpl::NewPoWValidBlock` — Announce to peers

### 3. Peer Connection & Handshake

How two Bitcoin nodes find each other and establish a connection.

**Stops:**
1. `net.cpp` → `CConnman::OpenNetworkConnection` — Initiate connection to a peer address
2. `net.cpp` → `CConnman::ConnectNode` — TCP socket is established
3. `net_processing.cpp` → `PushMessage("version")` — Send our version message
4. `net_processing.cpp` → `ProcessMessage("version")` — Receive their version
5. `net_processing.cpp` → `ProcessMessage("verack")` — Handshake complete
6. `net_processing.cpp` → `SendMessages` — Begin normal operation: request headers, announce txs

### 4. Wallet Creates & Sends a Transaction

From user intent to broadcast.

**Stops:**
1. `wallet/rpc/spend.cpp` → `sendtoaddress` — User calls RPC to send bitcoin
2. `wallet/spend.cpp` → `CreateTransaction` — Select coins, build transaction
3. `wallet/spend.cpp` → `CWallet::FundTransaction` — Choose UTXOs, calculate fee
4. `wallet/scriptpubkeyman.cpp` → `SignTransaction` — Sign with private keys
5. `wallet/wallet.cpp` → `CWallet::CommitTransaction` — Save to wallet database
6. `node/transaction.cpp` → `BroadcastTransaction` — Submit to local mempool
7. `net_processing.cpp` → `RelayTransaction` — Announce to peers

### 5. Initial Block Download (IBD)

How a new node syncs the entire blockchain.

**Stops:**
1. `net_processing.cpp` → `SendMessages` — Request headers from peers
2. `net_processing.cpp` → `ProcessMessage("headers")` — Receive and validate header chain
3. `net_processing.cpp` → `HeadersDirectFetchBlocks` — Request full blocks for validated headers
4. `net_processing.cpp` → `ProcessMessage("block")` — Receive a block
5. `validation.cpp` → `ConnectTip` — Connect block, update UTXO set
6. `validation.cpp` → `FlushStateToDisk` — Periodically flush to avoid data loss
7. `init.cpp` → IBD flag cleared — Fully synced, switch to normal operation

## Future Journeys

These can be added incrementally:

- **Script Evaluation** — How `OP_CHECKSIG` actually verifies a signature
- **Mempool Eviction** — What happens when the mempool is full
- **Chain Reorganization** — When a competing chain becomes the longest
- **Descriptor Wallet** — How modern key management works
- **RPC Request Handling** — From HTTP to response

## How Journeys Stay Accurate

Journeys reference function names, not line numbers. The parser locates functions in the current codebase. If a function is renamed or removed:

1. The parser flags the broken stop with a warning.
2. The journey renders with a "?" marker at that stop.
3. A maintainer updates the journey definition.

This keeps journeys decoupled from specific commits while still catching drift.

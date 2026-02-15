# 📘 **Omecord Call Flow Overview**  
*A complete end‑to‑end overview of how calls are created, routed, bridged, and terminated.*

---

# 🧭 **1. High‑Level System Architecture**

Omecord’s call system is composed of five major subsystems:

1. **Queue & Matchmaking Engine**  
   Determines *which* servers should be connected.

2. **MediaOrchestrator**  
   Creates, manages, and terminates sessions.

3. **VCSession / PrototypeSession**  
   The actual audio/video pipeline for a single call.

4. **AudioPipeline**  
   Mix-minus audio bridging between VCs.

5. **VideoPipeline**  
   SFU-style video routing between VCs.

These subsystems form a layered architecture:

```
User → Queue → Matchmaker → Orchestrator → Session → Audio/Video Pipelines
```

---

# 🔄 **2. Full Call Lifecycle (Step-by-Step)**

This is the complete flow from the moment a user joins a VC to the moment the call ends.

---

## **Step 1 — User Joins a Voice Channel**

A user enters a VC that is configured for Omecord call routing.

The bot detects:

- Guild ID  
- Channel ID  
- Mode (bridge, support, monitor)  
- Metadata (priority, staff flag, etc.)

The VC is added to the **QueueManager**:

```js
queueManager.add({
  guildId,
  channelId,
  mode,
  timestamp,
  metadata
});
```

---

## **Step 2 — Matchmaker Runs**

Every 2 seconds, the **CallMatchmaker** scans the queue:

```js
entries = queueManager.oldest()
```

It attempts to find a compatible pair using the routing rules:

- Bridge mode → any two bridge entries  
- Support mode → user VC ↔ staff VC  
- Monitor mode → attach to existing session  
- Custom mode → developer-defined logic  

If a match is found:

```js
matchmaker.createSession(A, B)
```

---

## **Step 3 — Orchestrator Creates a Session**

The matchmaker resolves the actual Discord channels:

```js
vcA = guildA.channels.get(A.channelId)
vcB = guildB.channels.get(B.channelId)
```

Then calls:

```js
mediaOrchestrator.startSession(vcA, vcB, {
  mode: A.mode,
  enableVideo: true
});
```

The orchestrator:

- Validates the request  
- Ensures no existing session for the guild  
- Creates a new `PrototypeSession` (or `VCSession` in production)  
- Stores it in `sessions` map  
- Starts the session  

---

## **Step 4 — Session Connects to Voice Channels**

Inside `PrototypeSession.start()`:

### **If testMode = false (real Discord)**  
The bot joins both VCs:

```js
connA = joinVoiceChannel(...)
connB = joinVoiceChannel(...)
```

### **If testMode = true (testing)**  
Fake connections are created:

```js
connA, connB = fakeConnectionFactory()
```

---

## **Step 5 — AudioPipeline Starts**

The session creates:

- `PrototypeAudioReceiver` for VC A  
- `PrototypeAudioReceiver` for VC B  
- `PrototypeAudioMixer`  
- `PrototypeAudioSender` for VC A  
- `PrototypeAudioSender` for VC B  

Flow:

```
Receiver(A) → Mixer → Sender(B)
Receiver(B) → Mixer → Sender(A)
```

This is **mix-minus** audio bridging.

---

## **Step 6 — VideoPipeline Starts (If Enabled)**

If `enableVideo = true`, the session creates:

- `VideoReceiver(A)`
- `VideoReceiver(B)`
- `VideoRouter`
- `VideoSender(A)`
- `VideoSender(B)`

Flow:

```
Receiver(A) → Router → Sender(B)
Receiver(B) → Router → Sender(A)
```

This is **SFU-style video routing**.

---

## **Step 7 — Call Is Active**

At this point:

- Audio is flowing both ways  
- Video is flowing both ways  
- The session is tracked by the orchestrator  
- The queue entries are removed  
- The matchmaker continues running for other servers  

The call is now fully active.

---

## **Step 8 — Call Ends**

A call can end due to:

- A user leaving  
- A timeout  
- A command (`/call stop`)  
- An error  
- A routing policy decision  

The orchestrator handles termination:

```js
mediaOrchestrator.stopSession(guildId)
```

This:

- Stops audio pipeline  
- Stops video pipeline  
- Destroys voice connections  
- Removes session from registry  

---

## **Step 9 — Cleanup & Requeue**

Depending on configuration:

- The guild may be re-added to the queue  
- Or remain idle  
- Or enter cooldown  

This allows continuous matchmaking.

---

# 🧱 **3. Component Interaction Diagram**

```
  ┌──────────────────────────┐
  │        User Joins        │
  └─────────────┬────────────┘
                │
                ▼
  ┌──────────────────────────┐
  │      QueueManager        │
  └─────────────┬────────────┘
                │
                ▼
  ┌──────────────────────────┐
  │      CallMatchmaker      │
  └─────────────┬────────────┘
                │
                ▼
  ┌──────────────────────────┐
  │    MediaOrchestrator     │
  └─────────────┬────────────┘
                │
                ▼
  ┌──────────────────────────┐
  │       VCSession          │
  │  (or PrototypeSession)   │
  └─────────────┬────────────┘
                │
      ┌─────────┴─────────┐
      ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ AudioPipeline │   │ VideoPipeline │
└───────────────┘   └───────────────┘
```

---

# 🎥 **4. Audio vs Video Flow Summary**

| Feature | AudioPipeline | VideoPipeline |
|--------|---------------|---------------|
| Type | Mixed | Routed (SFU) |
| Processing | PCM mix-minus | Encoded frame forwarding |
| Direction | Bidirectional | Bidirectional |
| Complexity | Medium | High |
| Prototype | Fully implemented | Simulated (until Discord exposes API) |

---

# 🧩 **5. Modes Overview**

### **Bridge Mode**
VC ↔ VC  
Standard two-way call.

### **Support Mode**
User VC ↔ Staff VC  
Used for support queues.

### **Monitor Mode**
Monitor VC → Existing session  
Listen-only.

### **Custom Mode**
Developer-defined routing.
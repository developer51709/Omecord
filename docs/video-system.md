# 📘 **Omecord Video System Documentation**

## 📌 Overview

The Omecord Video System is responsible for capturing, routing, and forwarding video streams between Discord voice channels. Unlike audio (which is mixed), video is **routed** — Omecord acts as a lightweight **SFU (Selective Forwarding Unit)**.

The video subsystem is designed to:

- Work alongside the audio subsystem  
- Support prototype (fake) video for testing  
- Support real Discord video when Discord exposes the API  
- Integrate cleanly with `MediaOrchestrator`  
- Run in multiple modes (bridge, support, monitor, custom)  
- Scale to multi‑VC routing in the future  

---

# 🧩 **Architecture**

The video system consists of four core components:

| Component | Responsibility |
|----------|----------------|
| **VideoReceiver** | Captures encoded video frames from a VC |
| **VideoRouter** | Decides which frames go to which VC (SFU logic) |
| **VideoSender** | Sends encoded frames to the destination VC |
| **VideoPipeline** | Connects receiver → router → sender |

These components are designed to mirror the audio system’s structure, but with routing instead of mixing.

---

# 🎥 **Video Flow Diagram**

```
VC A (incoming video) → VideoReceiver(A)
                          ↓
                     VideoRouter
                          ↓
VC B (outgoing video) ← VideoSender(B)
```

And the reverse:

```
VC B (incoming video) → VideoReceiver(B)
                          ↓
                     VideoRouter
                          ↓
VC A (outgoing video) ← VideoSender(A)
```

This creates a **bidirectional video bridge**.

---

# 🧪 **Prototype vs Production**

The prototype uses:

- Fake encoded frames  
- Fake video streams  
- No real Discord video API  
- No encoding/decoding  
- No bandwidth management  

The production version will add:

- Real Discord video frame capture  
- Real encoded frame forwarding  
- Resolution negotiation  
- Bitrate control  
- Multi‑user routing  
- Hardware acceleration (optional)  

The prototype is intentionally simple so you can validate the architecture before Discord exposes full video APIs.

---

# 🧱 **Component Documentation**

## 1. **VideoReceiver**

### Purpose  
Captures encoded video frames from a voice connection.

### Prototype Behavior  
Since Discord does not expose video frames yet, the prototype uses:

```js
connection.fakeVideo.onFrame(cb)
```

This allows the test harness to simulate video.

### Production Behavior  
Will subscribe to Discord’s video stream once available.

---

## 2. **VideoRouter**

### Purpose  
Implements SFU logic — decides which frames go where.

### Prototype Behavior  
Simple “route everything from A → B and B → A”.

### Production Behavior  
Will support:

- Per‑user routing  
- Resolution downscaling  
- Bandwidth adaptation  
- Multi‑VC routing  
- Selective forwarding (only forward active speakers or selected users)  

---

## 3. **VideoSender**

### Purpose  
Sends encoded frames to the destination VC.

### Prototype Behavior  
Stores frames in an array for testing.

### Production Behavior  
Will push encoded frames into Discord’s video transport.

---

## 4. **VideoPipeline**

### Purpose  
Connects the entire video system:

```
Receiver → Router → Sender
```

### Prototype Behavior  
Simple routing loop.

### Production Behavior  
Will include:

- Frame timing  
- Jitter buffers  
- Error recovery  
- Adaptive routing  

---

# 🔌 **Integration with MediaOrchestrator**

The orchestrator enables video by passing:

```js
enableVideo: true
```

into the session constructor.

Inside `PrototypeSession`:

```js
if (this.enableVideo) {
    this.videoPipeline = new VideoPipeline(connA, connB);
}
```

This makes video optional and modular.

---

# 🧪 **Testing the Video System**

The video system is fully testable without Discord.

### Test Harness Provides:

- Fake video frames  
- Fake video connections  
- Fake frame timing  
- Full pipeline simulation  

### Test Stages

1. **Receiver Test**  
   Ensures frames are captured.

2. **Router Test**  
   Ensures frames route correctly.

3. **Sender Test**  
   Ensures frames are delivered.

4. **Pipeline Test**  
   Ensures end‑to‑end routing works.

5. **Stress Test**  
   Ensures stability under load.

---

# 🚀 **Future Expansion**

The video system is designed to evolve into a full SFU:

### Planned Features

- Multi‑user video routing  
- Per‑user resolution control  
- Dynamic bitrate  
- Hardware‑accelerated encoding  
- Multi‑VC video distribution  
- Recording  
- Screenshare routing  
- Video moderation tools  

---

# 🧭 **Where This Fits in the Call Engine**

The call engine will eventually consist of:

- **AudioPipeline** (mix-minus)
- **VideoPipeline** (SFU)
- **RoutingPolicy**
- **VCSession**
- **MediaOrchestrator**
- **CallDeterminationEngine**
- **Command Interface**
- **Metrics + Logging**

The video system is the second major subsystem after audio.
# 📘 **Omecord Call System — Technical Documentation (Draft v1)**

## **Overview**
The Omecord Call System is a real‑time audio and video routing engine designed to connect multiple Discord voice channels with minimal latency, zero feedback, and high resilience. It is the core subsystem that enables:

- Support line calls  
- VC bridging  
- Monitoring sessions  
- Multi‑VC conferencing  
- Future video routing features  

The system is built around **mix‑minus audio routing**, **SFU‑style video forwarding**, and **per‑VC isolation** to ensure reliability and scalability.

---

# **1. Architecture Summary**

```
  ┌──────────────────────────────┐
  │        Media Orchestrator    │
  │  - Session registry          │
  │  - Routing policies          │
  │  - Worker supervision        │
  └───────────────┬──────────────┘
                  │
       ┌──────────┴─────────┐
       │                    │
┌──────┴───────┐     ┌──────┴───────┐
│  VC Session  │     │  VC Session  │
│ (Guild A VC1)│     │ (Guild B VC3)│
└──────┬───────┘     └──────┬───────┘
       │                    │
 ┌─────┴──────┐       ┌─────┴──────┐
 │ AudioPipe  │       │ AudioPipe  │
 │ VideoPipe  │       │ VideoPipe  │
 └─────┬──────┘       └─────┬──────┘
       │                    │
       └──────────┬─────────┘
                  │
           ┌──────┴───────┐
           │   Mixer/SFU  │
           │  (Mix-Minus) │
           └──────────────┘
```

---

# **2. Core Components**

## **2.1 Media Orchestrator**
The central controller for all media operations.

### Responsibilities
- Create, manage, and destroy VC sessions  
- Enforce routing policies  
- Monitor worker health  
- Handle degradation and recovery  
- Provide metrics and diagnostics  

### Key Guarantees
- No VC pipeline can affect another  
- Sessions can be restarted independently  
- Routing rules are deterministic and predictable  

---

## **2.2 VC Session**
A VC session represents a single Discord voice channel with active media processing.

### Contains
- `AudioPipeline`
- `VideoPipeline`
- Session state (`IDLE`, `CONNECTING`, `ACTIVE`, `DEGRADING`, `FAILED`)
- Connected users
- Routing configuration

### Lifecycle
```
IDLE → CONNECTING → ACTIVE → (DEGRADING ↔ RECOVERING) → STOPPED
```

---

## **2.3 Audio Pipeline**
Handles all audio capture, mixing, and output.

### Components
- **AudioReceiver**  
  Captures PCM audio per user.

- **AudioMixer**  
  Performs mix‑minus routing:
  - VC A receives audio from B, C, D  
  - VC A does NOT receive its own audio  

- **AudioSender**  
  Sends mixed audio back into Discord.

### Feedback Prevention
Mix‑minus ensures **no VC ever hears its own audio**, eliminating feedback loops entirely.

---

## **2.4 Video Pipeline**
Handles video forwarding using an SFU‑style model.

### Components
- **VideoReceiver**  
  Captures video streams (when Discord allows).

- **VideoRouter**  
  Forwards video streams to other VCs/users.

- **VideoSender**  
  Sends encoded video back into Discord.

### Feedback Prevention
A VC never receives its own video stream.

---

# **3. Routing Policies**

Routing policies define “who hears/sees whom.”

## **3.1 Bridge Mode**
Two VCs connected bidirectionally.

```
A hears: B
B hears: A
```

## **3.2 Support Mode**
One caller, one agent.

```
Caller ↔ Agent
Observers → Caller (listen only)
```

## **3.3 Monitor Mode**
Staff monitors a VC silently.

```
Staff hears VC
VC does NOT hear staff
```

## **3.4 Multi‑VC Conference**
Multiple VCs merged into one logical room.

```
A hears: B + C
B hears: A + C
C hears: A + B
```

---

# **4. Reliability & Resilience**

## **4.1 Per‑VC Isolation**
Each VC session runs independently.  
If one crashes, others continue unaffected.

## **4.2 Graceful Degradation**
Under load:
1. Lower video resolution  
2. Lower audio bitrate  
3. Drop video entirely  
4. Limit new sessions  

## **4.3 Circuit Breakers**
If a guild repeatedly causes failures:
- Temporarily disable media features  
- Log the issue  
- Auto‑retry later  

## **4.4 Health Monitoring**
Metrics tracked:
- CPU usage per session  
- Bandwidth usage  
- Packet loss  
- Mixer queue sizes  
- Active pipelines  

---

# **5. Data Flow**

## **5.1 Audio Flow**
```
User → Discord VC → AudioReceiver → Mixer → AudioSender → Discord VC → User
```

## **5.2 Video Flow**
```
User → Discord VC → VideoReceiver → SFU Router → VideoSender → Discord VC → User
```

---

# **6. Failure Modes & Recovery**

## **6.1 Receiver Failure**
- Restart receiver  
- Reconnect to VC  
- If repeated: degrade session  

## **6.2 Mixer Overload**
- Drop non‑critical streams  
- Lower quality  
- If persistent: pause video  

## **6.3 Sender Failure**
- Retry  
- Recreate sender  
- Reconnect to VC  

## **6.4 Full Session Failure**
- Restart session  
- Notify orchestrator  
- Log root cause  

---

# **7. Configuration**

## **7.1 Limits**
- Max concurrent sessions  
- Max bridged VCs  
- Max video bitrate  
- Max audio bitrate  
- Max users per session  

## **7.2 Modes**
- `bridge`
- `support`
- `monitor`
- `conference`

---

# **8. Future Expansion**

- Multi‑shard media bus  
- Dedicated media worker processes  
- Adaptive bitrate (ABR)  
- Per‑user volume control  
- Echo cancellation (AEC)  
- Noise suppression (NS)  
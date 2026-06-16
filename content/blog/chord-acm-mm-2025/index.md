---
title: 'CHORD: Personalized On-device Recommendation via Device-Cloud Mixed-precision Quantization'
date: Oct 2025
authorId: tianqi-liu-2025-22551275
links:
  - kind: paper
    href: https://arxiv.org/abs/2510.03038
desc: >-
  CHORD customizes a hybrid-precision on-device reranking model for each user
  through device-cloud collaboration: a cloud-side hypernetwork scores parameter
  sensitivity and emits a channel-wise quantization plan in only 2 bits per
  channel, giving fast, personalized adaptation in a single forward pass.
  Accepted to ACM MM 2025.
tags:
  - Recommender Systems
  - Device-Cloud Collaboration
  - Model Quantization
  - On-device Deployment
cover: cover.png
coverAlt: CHORD device-cloud mixed-precision quantization overview
---
We are glad to share **CHORD**, accepted to **ACM MM 2025**. CHORD studies how to put a personalized reranking model **on the device** while keeping recommendation accuracy high and the deployment budget small.

Modern recommenders increasingly want to run on phones: on-device inference is private, low-latency, and offloads the cloud. But a single cloud-trained model is the same for everyone, and shrinking it for each device usually means **per-user retraining or on-device backpropagation** — too expensive to do at scale. CHORD asks a simpler question: can the cloud tell each device *which parameters matter for this user*, and let the device cheaply adapt without any training?

## The idea: customize precision, not weights

CHORD keeps the model weights **frozen** and personalizes through **channel-wise mixed-precision quantization**. Instead of fine-tuning, the cloud decides, per user, how many bits each channel should keep — important channels stay high-precision, less important ones are aggressively quantized.

The pipeline is a clean device-cloud split:

- **Cloud — sensitivity scoring.** An auxiliary **hypernetwork** analyzes parameter sensitivity for each user across **multiple granularities** (layer, filter, and element level) and produces a per-channel precision plan tailored to that user's behavior.
- **Communication — 2 bits per channel.** The cloud only needs to ship the **quantization strategy**, encoded with just **2 bits per channel** instead of transmitting 32-bit weights, so the device-cloud message stays tiny.
- **Device — one forward pass.** The device applies the received mixed-precision plan to its frozen model. Adaptation requires **no backpropagation** — model customization and compression happen in a **single forward pass**, which also accelerates inference.

The result is a model that is **both fast and personalized**: each device gets a compact, user-specific model without ever training locally.

## Why this is nice

- **Personalization without retraining.** The heavy lifting (sensitivity analysis) lives on the cloud; the device just executes a plan.
- **Resource-adaptive.** The bit budget can flex to each device's compute and memory.
- **Cheap to deploy and update.** Updating a user's model means sending a few bits per channel, not a new weight matrix.

## Experiments

We evaluate CHORD on **three real-world datasets** with two widely used sequential-recommendation backbones, **SASRec** and **Caser**, showing that channel-wise mixed-precision customization preserves recommendation quality while making the on-device model smaller and faster. Full results and ablations are in the paper.

## Links

- Paper: <https://arxiv.org/abs/2510.03038>

If you work on device-cloud collaboration, on-device recommendation, or efficient personalization, I'd love to compare notes — see my [profile](/tianqi-liu-2025-22551275) for contact.

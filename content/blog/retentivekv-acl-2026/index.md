---
title: 'RetentiveKV: State-Space Memory for Uncertainty-Aware Multimodal KV Cache Eviction'
date: Jun 2026
author: Sihao Liu
desc: >-
  RetentiveKV reformulates KV cache eviction from discrete context truncation to
  continuous memory evolution using entropy-driven State Space Models, achieving
  5× KV cache compression and 1.5× decoding acceleration on multimodal benchmarks.
  Accepted to ACL 2026 Findings.
links:
  - kind: paper
    href: https://arxiv.org/abs/2605.04075
tags:
  - KV Cache
  - Multimodal LLMs
  - State Space Models
  - Efficient Inference
  - ACL 2026
---
We are happy to share that **RetentiveKV** has been accepted to **ACL 2026 Findings**.

Multimodal Large Language Models face severe challenges in computational efficiency and memory consumption due to the substantial expansion of the visual KV cache when processing long visual contexts. Existing KV cache compression methods typically rely on the "persistence of importance" hypothesis to prune tokens — but this proves fragile in multimodal settings. RetentiveKV takes a fundamentally different approach: instead of permanently discarding tokens, we reformulate KV eviction from **discrete context truncation** to **continuous memory evolution** based on State Space Models.

## The problem: why importance-based eviction fails for multimodal models

Current KV cache compression methods assume that tokens with high initial attention remain critical throughout decoding. However, we identify two key issues that break this assumption in multimodal contexts:

1. **Deferred Importance.** Visual tokens often exhibit low initial salience but become pivotal at later decoding timesteps. Early decoding prioritizes semantic comprehension of the textual query, while attention pivots toward visual tokens only when generating responses requiring specific visual attributes. Importance-based pruning prematurely evicts these "deferred-critical" tokens.

2. **Visual Continuity Collapse.** Visual tokens are characterized by intrinsic spatial continuity and strong inter-patch correlations. Discrete eviction of KV pairs fragments these continuous representations, disrupting spatial coherence. Existing modality-aware methods that merely adjust compression ratios fail to fundamentally address this structural discontinuity.

## RetentiveKV: from discrete pruning to continuous state evolution

Drawing inspiration from State Space Models (SSMs), RetentiveKV assimilates low-attention tokens into a continuous state space governed by information entropy, rather than permanently discarding them. This preserves visual tokens exhibiting high uncertainty during early decoding and updates them continuously as decoding progresses — all with only O(1) memory overhead.

The framework consists of three core components:

![RetentiveKV framework overview: the architecture coordinates efficient long-context multimodal reasoning through an Entropy-Guided KV Retention Estimator, an Entropy-Guided State Transition mechanism, and a Query-Conditioned State Retrieval module.](overall.png)

### 1. Entropy-Guided KV Retention Estimator

Traditional eviction uses only immediate attention scores. RetentiveKV adds a **prospective uncertainty** dimension: we leverage the entropy of the cross-modal attention distribution (from textual tokens to visual tokens) to estimate the "undetermined potential" of low-attention tokens.

The retention score combines both signals:

$$R^{l,i}_t = \lambda \alpha^{l,i}_t + (1 - \lambda) H^{l,i}_t$$

where $\alpha$ is the attention score and $H$ is the cross-modal attention entropy. High entropy indicates diffuse attention across visual tokens — implying high uncertainty and potential relevance for subsequent decoding.

### 2. Entropy-Guided State Transition

Instead of binary keep/discard decisions, evicted KV pairs are absorbed into a continuous state space. The state evolves via a recursive update:

$$S_t = H_t \odot S_{t-1} + A_t \odot (k_t^\top v_t)$$

where $H_t$ is the retention matrix (modulated by token-level entropy) and $A_t$ is the absorption matrix (modulated by accumulated attention). This formulation preserves selective attention to historical segments while naturally incorporating positional and spatial information.

### 3. Dual-State Architecture

Inspired by hierarchical human memory, RetentiveKV maintains two complementary states:

| State | Purpose | Design |
| --- | --- | --- |
| **Visual-Dominant State** ($S_V$) | Preserve spatial topology of visual patches | Spatially-aware SSM with root-patch conditioning and Manhattan-distance decay |
| **Recall-Oriented State** ($S_T$) | Capture long-term semantic dependencies | Sliding window for recent tokens + entropy-guided absorption for evicted tokens |

During inference, a **Query-Conditioned Retrieval** mechanism dynamically queries both states, retrieving and reactivating deferred-critical information only when semantic relevance is detected:

$$O_t = \text{Attn}_{\text{local}}(q_t, K_{\text{local}}, V_{\text{local}}) + O^{(t)}_S$$

## Experimental results

We evaluate RetentiveKV across three MLLM architectures (LLaVA-v1.5-7B, Qwen3-VL-4B, Qwen3-VL-8B) on eight benchmarks covering document understanding, mathematical reasoning, holistic perception, conversational QA, and embodied AI.

**Key results:**

- **Fine-grained visual perception** (DocVQA, TextVQA): +2.1 points over importance-centric baselines, thanks to entropy-guided preservation of high-uncertainty visual tokens.
- **Long-context reasoning** (MMCoQA, ALFRED): +3.0 points over modality-aware baselines, demonstrating effective retrieval of deferred-critical information under long-horizon reasoning.
- **Efficiency**: At 5% cache budget, RetentiveKV reduces memory from 2.24 GiB to 0.23 GiB (achieving **5× KV cache compression**) and accelerates decoding by **1.75×** (from 32.15 ms/token to 18.42 ms/token).

| Method | Budget | Latency | Memory |
| --- | --- | --- | --- |
| Full Cache | 100% | 32.15 ms/token | 2.24 GiB |
| RetentiveKV | 50% | 27.84 ms/token | 1.18 GiB |
| RetentiveKV | 20% | 21.42 ms/token | 0.46 GiB |
| RetentiveKV | 5% | 18.42 ms/token | 0.23 GiB |

Under extreme compression (5%–10% budget), conventional methods suffer abrupt performance degradation, confirming the Deferred Importance hypothesis. RetentiveKV maintains robust performance stability across all budget levels.

## Ablation highlights

| Component | Avg. impact |
| --- | --- |
| Query-Conditioned Retrieval (QR) | −4.6% to −5.4% without it |
| Modality-Agnostic dual state (MA) | −3.1% with unified state |
| Entropy-driven metric (EM) | −2.9% (MMCoQA), −4.6% (DocVQA) without it |

The query-conditioned retrieval mechanism is the most critical component — it enables the model to recall specific visual and textual cues that were previously evicted, mitigating irreversible information loss.

## Takeaway

RetentiveKV demonstrates that KV cache eviction need not be a one-way operation. By reinterpreting low-attention tokens through information entropy and absorbing them into continuously evolving state spaces, we preserve both spatial continuity and deferred semantic relevance — achieving substantial compression without the fragility of discrete pruning.

## Further reading

- Paper: [RetentiveKV on arXiv](https://arxiv.org/abs/2605.04075)
---
startDate: 2022
name: "Zihao Tang"
photo: photo.jpg
bio: >-
  Graduated Master student from AI4GC Lab, Zhejiang University. His research focuses on LLM Agents, AI Memory, and Agentic RL.
tags:
  - Now @ Microsoft
  - LLM Agents
  - AI Memory
  - Agentic RL
email: tangzihao@zju.edu.cn
profile: true
links:
  - label: Homepage
    href: https://ishikura-a.github.io/
    kind: website
  - label: Google Scholar
    href: https://scholar.google.com/citations?user=YBffTgsAAAAJ
    kind: social
  - label: LinkedIn
    href: https://www.linkedin.com/in/%E5%AD%90%E8%B1%AA-%E5%94%90-99aa85367/
    kind: social
---

## About Me

Hi! I am **Zihao Tang** (唐子豪), a graduated Master student from AI4GC Lab at Zhejiang University.

My research focuses on **LLM Agents**, **AI Memory**, and **Agentic RL**. I am especially interested in agents that can accumulate experience, form reusable procedures, and improve through interaction rather than solving each task from scratch.

I am currently affiliated with Microsoft.

## During AI4GC

During my time at AI4GC Lab, I worked on efficient and adaptable AI systems, moving from knowledge transfer under distribution shift to LLM-assisted model generation. In **AuG-KD**, I studied data-free knowledge distillation when teacher-domain knowledge cannot be directly transferred to real-world student domains, using uncertainty-guided anchors and mixup generation to selectively transfer useful knowledge. This line of work gave me a practical lens on **adaptation**: useful AI systems should not only perform well in controlled settings, but also adjust to new users, domains, and deployment constraints.

I then explored this direction through **ModelGPT**, which uses LLMs to generate tailored models from user data or task descriptions, making model construction faster and more accessible across NLP, CV, and tabular tasks. During my internship at MSRA, I also worked on **Sigma**, an efficient system-domain LLM built around DiffQKV attention. Together, these projects shaped my interest in systems that connect model capability with real deployment needs, from model generation to efficient long-context inference.

## @papers Selected Papers

@bib papers.bib

- tang2026mnemis
- li2025tl
- lin2025sigmadifferentialrescalingquery
- augkdanchorbasedmixup2024
- tang2024modelgptunleashingllmscapabilities

## Now

**Now:** Affiliated with Microsoft; continuing research on LLM Agents, AI Memory, and Agentic RL.

At Microsoft, our team focuses on **LLM Agents**, **AI Memory**, and **Agentic RL**. We are interested in how agents can remember, reason, search, code, and improve across long-horizon interactions, while keeping both memory retrieval and reasoning efficient. In **Mnemis**, I drive the technical direction for long-term memory retrieval beyond similarity-only RAG, combining System-1 similarity search with System-2 Global Selection over base and hierarchical memory graphs. With GPT-4.1-mini, Mnemis achieves **state-of-the-art results**: 93.9 on LoCoMo and 91.6 on LongMemEval-S.

Currently, we are exploring **search agents**, **code agents**, and **procedural memory**, especially how agents can turn experience into reusable action knowledge. The broader goal is to move from agents that complete isolated tasks toward agents that build up skills, habits, and memory over time.

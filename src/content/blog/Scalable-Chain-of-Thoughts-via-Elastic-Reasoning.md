---
title: "Scalable Chain of Thoughts via Elastic Reasoning"
description: "Salesforce AI Research developed 'Elastic Reasoning,' a framework that enables Large Reasoning Models (LRMs) to operate effectively under strict output length constraints."
pubDate: 2026-02-11
heroImage: ../../assets/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Scalable_Hero.png
tags: [AI, LLM, Research]
---

## Summary
Salesforce AI Research developed 'Elastic Reasoning,' a framework that enables Large Reasoning Models (LRMs) to operate effectively under strict output length constraints. It achieves this by separating reasoning output into independent 'thinking' and 'solution' budgets and employing a budget-constrained reinforcement learning strategy. This approach led to over 30% reduction in token usage, improved performance on math and programming benchmarks (e.g., 35.0% accuracy on AIME2024), and significantly lower training costs compared to existing methods, making reasoning models more practical for real-world deployment.

## Overview

Elastic Reasoning addresses a critical bottleneck in deploying Large Reasoning Models (LRMs) that use Chain-of-Thought (CoT) prompting: their tendency to generate excessively long outputs that consume significant computational resources and increase inference costs. While CoT has revolutionized LLM performance on complex tasks like mathematics and programming by enabling step-by-step reasoning, the uncontrolled length of these reasoning chains creates practical deployment challenges in resource-constrained environments.
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_1.png)

The research introduces a framework that enables LRMs to maintain their reasoning capabilities while operating under strict inference-time budget constraints. The approach fundamentally reconceptualizes how reasoning models allocate their computational resources during inference, separating the reasoning process into distinct phases with independent budget allocations.

## Problem Context and Motivation
Current Chain-of-Thought models face a fundamental deployment paradox: their reasoning capabilities rely on generating lengthy intermediate steps, but these extended outputs create prohibitive costs and latency issues for real-world applications. Existing length control methods fall into two categories, each with significant limitations.
General text generation length control methods, such as manipulating positional encodings or modifying training objectives, work well for tasks like summarization but fail to preserve the structured nature of reasoning processes. These approaches treat reasoning chains as regular text, potentially disrupting the logical flow essential for correct problem-solving.
Reasoning-specific length control methods, including approaches like Budget Forcing (S1) and L1, attempt to address the structured nature of reasoning but suffer from critical flaws. Budget Forcing simply truncates outputs when token limits are reached, often cutting off the final solution and rendering the entire output useless. L1 uses reinforcement learning for dynamic allocation but requires expensive training and still shows performance degradation under constraints.
The core issue with existing methods is their failure to recognize that reasoning outputs have two functionally distinct components: the intermediate thinking process and the final solution. Naive truncation frequently eliminates the solution entirely, while current training approaches don't adequately prepare models for the reality of truncated reasoning during deployment.

## Methodology
Elastic Reasoning introduces two complementary innovations: Separate Budgeting for Inference and Budget-Constrained Rollout for Training.
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_2.png)

## Separate Budgeting for Inference
The inference mechanism explicitly divides the total computational budget into two independent allocations. Given a total inference budget $c$, the framework allocates $t$ tokens for the thinking phase and $s$ tokens for the solution phase, where $c = t + s$.
During generation, the model begins producing content within designated thinking markers (<think> and </think>). If the model naturally concludes its reasoning by emitting </think> before exhausting the $t$-token budget, it immediately transitions to generating the final solution. However, if the thinking budget is exhausted before natural conclusion, the framework forcibly appends </think> to terminate the reasoning phase.
This mechanism guarantees that the solution component receives its dedicated budget allocation, preventing the common failure mode where truncation eliminates the final answer entirely. The thinking budget can be dynamically adjusted at inference time to accommodate different application requirements without requiring model retraining.

## Budget-Constrained Rollout for Training
While Separate Budgeting handles inference-time allocation, models still require training to reason effectively under truncated conditions. The training component uses reinforcement learning with Generalized Policy Optimization (GRPO) to teach models adaptive reasoning under budget constraints.
During training, the framework simulates the inference-time budgeting process. The model generates responses subject to budget constraints $(t^*, s^*) = (1000, 1000)$ tokens. The thinking segment is generated up to the $t^*$ limit, with forced termination if necessary, followed by solution generation within the $s^*$ budget.
The training process optimizes the model's policy $\pi_\theta$ to maximize task-specific rewards while operating under these constraints:
$$
\max_\theta \mathbb{E}_{x \sim D, y \sim \pi_\theta(\cdot|x)} [r(y)]
$$
where $r(y)$ represents the task-specific reward function evaluating solution quality.
A key insight from the training approach is that models trained with a fixed, relatively modest budget generalize remarkably well to diverse budget configurations at test time. This eliminates the need for extensive retraining across different deployment scenarios.

## Results and Performance
The empirical evaluation demonstrates Elastic Reasoning's effectiveness across mathematical and programming domains using two specialized models: E1-Math-1.5B (based on DeepScaleR-1.5B-Preview) and E1-Code-14B (based on DeepCoder-14B-Preview).
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_3.png)


## Performance Under Budget Constraints
On mathematical reasoning benchmarks, E1-Math-1.5B consistently outperforms existing length control methods. On the challenging AIME2024 dataset, it achieves 35.0% accuracy compared to L1-Max's 27.1% and L1-Exact's 24.2%. The performance advantage is maintained across various budget constraints, demonstrating the framework's robustness.
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_4.png)

For programming tasks, E1-Code-14B shows remarkable scalability. While the base DeepCoder-14B-Preview model fails catastrophically under tight constraints (achieving less than 10% accuracy with budgets under 4K tokens), E1-Code-14B maintains steady performance improvement as budget increases. On Codeforces, E1-Code-14B achieves a rating of 1987 (96.0 percentile), demonstrating competitive performance with state-of-the-art models.
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_5.png)

## Efficiency and Conciseness
A particularly striking finding is that Elastic Reasoning models generate significantly shorter outputs than their base models, even in unconstrained settings. E1-Math-1.5B reduces average token usage by over 30% across datasets, while E1-Code-14B reduces usage by 37.4% on LiveCodeBench (from 17,815 to 11,145 tokens).
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_6.png)

This reduction occurs while maintaining or slightly improving performance, suggesting that the training process encourages more focused and efficient reasoning rather than simply enforcing arbitrary length limits.

## Generalization and Training Efficiency
Models trained with fixed budget constraints demonstrate strong generalization to unseen budget configurations at test time. The framework achieves competitive performance across diverse evaluation scenarios without requiring additional fine-tuning for each specific budget constraint.
![alt text](/blog/Scalable-Chain-of-Thoughts-via-Elastic-Reasoning/Fig_7.png)

Additionally, the training process requires significantly fewer computational resources compared to baseline methods. E1-Math-1.5B requires only 200 training steps compared to 700 steps for L1-Exact and 820 for L1-Max, representing substantial cost savings.

## Technical Innovation and Significance
Elastic Reasoning's primary innovation lies in recognizing and addressing the structural properties of reasoning outputs rather than treating them as undifferentiated text. By explicitly separating thinking and solution phases, the framework preserves the functional integrity of reasoning processes under resource constraints.
The budget-constrained rollout training strategy represents a novel application of reinforcement learning to instill specific behavioral properties (budget-awareness and conciseness) in language models. Unlike previous approaches that simply penalize length or force early termination, this method teaches models to reason adaptively when their thought processes are truncated.
The framework's ability to improve efficiency even in unconstrained settings suggests that the training process encourages fundamental improvements in reasoning quality rather than mere compression. This indicates a deeper optimization of the reasoning process itself, prioritizing informative content and eliminating redundancy.


## Implications and Future Directions
Elastic Reasoning directly addresses the practical deployment gap between powerful reasoning models and real-world resource constraints. By enabling reliable performance under strict budget limits while reducing overall computational requirements, the framework makes advanced reasoning capabilities accessible to a broader range of applications and deployment scenarios.
The approach opens several promising research directions. The framework's current focus on clearly separated thinking and solution phases may require extension for tasks with more complex reasoning structures, such as multi-step interactive problem-solving or iterative refinement processes.
Additionally, while the framework ensures solution completeness, questions remain about the interpretability and trustworthiness of reasoning when intermediate steps are truncated. Future work should explore methods for maintaining reasoning transparency and developing guidelines for safe deployment in high-stakes applications where justification completeness is critical.
The demonstrated generalization capabilities suggest potential for developing unified models that can dynamically adapt to varying computational budgets across diverse deployment contexts, representing a significant step toward more flexible and practical AI systems.

## Relevant Citations

L1: Controlling how long a reasoning model thinks with reinforcement learning
This paper presents a direct and highly relevant competing method to Elastic Reasoning. L1 also uses a reinforcement learning framework to manage generation length, making it a key baseline against which the presented work's performance, efficiency, and training costs are compared throughout the experiments.
Pranjal Aggarwal and Sean Welleck. L1: Controlling how long a reasoning model thinks with reinforcement learning. URL2025.

---
s1: Simple test-time scaling
The S1 method, referred to as 'budget forcing' in the paper, is another primary baseline used for comparison. The core idea of Elastic Reasoning, particularly 'Separate Budgeting', is presented as a superior alternative to S1's simpler truncation strategy, highlighting its ability to preserve the crucial solution part of the generation.
Niklas Muennighoff, Zitong Yang, Weijia Shi, Xiang Lisa Li, Li Fei-Fei, Hannaneh Hajishirzi, Luke Zettlemoyer, Percy Liang, Emmanuel Candès, and Tatsunori Hashimoto. s1: Simple test-time scaling, 2025. URLhttps://arxiv.org/abs/2501.19393.

---
Deepscaler: Surpassing O1-preview with a 1.5 b model by scal-ing reinforcement learning
This paper introduces DeepScaleR, the base model used for the mathematical reasoning experiments in the main paper. DeepScaleR exemplifies the powerful but inefficient reasoning models with uncontrolled output lengths that Elastic Reasoning is designed to address, making it a perfect use-case and starting point for demonstrating the effectiveness of the proposed method.
Michael Luo, Sijun Tan, Justin Wong, Xiaoxiang Shi, William Y. Tang, Manan Roongta, Colin Cai, et al.Deepscaler: Surpassing O1-preview with a 1.5 b model by scal-ing reinforcement learning, 2025.URLhttps://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2. Notion blog post.

---
Chain-of-thought prompting elicits reasoning in large language models
This is the foundational paper that introduced Chain-of-Thought (CoT) prompting. The entire problem domain of the main paper—managing the length, cost, and efficiency of extended reasoning trajectories—is built upon the CoT paradigm established by this work, making it a critical and fundamental citation.
Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, and Denny Zhou. Chain-of-thought prompting elicits reasoning in large language models, 2023. URLhttps://arxiv.org/abs/2201.11903.

---

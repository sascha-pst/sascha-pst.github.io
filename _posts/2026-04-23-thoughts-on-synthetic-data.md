---
layout: post
title: "Thoughts on Synthetic Data"
date: 2026-04-23
tags: [data-science, fairness, healthcare]
excerpt: "We talk a lot about synthetic meat. Can we talk about synthetic data in your healthcare for a second?"
---
We talk a lot about synthetic meat. Can we talk about synthetic data in your healthcare for a second?

[The UK uses synthetic data](https://pmc.ncbi.nlm.nih.gov/articles/PMC9951365/). Scalable, privacy-preserving, [increasingly the default](https://pubmed.ncbi.nlm.nih.gov/39603900/).

[Taiwan's national health system uses federated learning](https://pubmed.ncbi.nlm.nih.gov/37822805/). The model goes to the data. Privacy preserved, outcomes improved, training data that reflects the population it serves.

The US? Neither. Not coherently. Not at the federal level.

Here's the question I keep sitting with:

> ***If AI training data is generated from a system that [already underserves certain populations](https://pubmed.ncbi.nlm.nih.gov/36812532/), will the synthetic version fix the gap or reproduce it?***

[Boosting can reweight underrepresented groups](https://pubmed.ncbi.nlm.nih.gov/38288010/) during training. That helps, but only if those groups are in the data. You can't boost what was never collected. You can't reweight someone who never made it into the system.

One fall shouldn't be the difference between keeping your house or your arm. And the AI tools we're building on top of that system should at minimum not make the gap worse.

Federated learning, synthetic data, boosting — none are perfect alone. Together, with [honest accounting of who's absent and why](https://pmc.ncbi.nlm.nih.gov/articles/PMC11555762/), they start to look like a real framework.

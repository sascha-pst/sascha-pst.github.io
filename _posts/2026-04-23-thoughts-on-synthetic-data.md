---
layout: post
title: "You Can't Boost What Was Never Collected"
date: 2026-04-23
tags: [data-science, fairness, healthcare]
excerpt: "We talk a lot about synthetic beef. Can we talk about synthetic data in your healthcare for a second?"
---
We talk a lot about synthetic beef. Can we talk about synthetic data in your healthcare for a second?

The [UK uses synthetic data](https://pmc.ncbi.nlm.nih.gov/articles/PMC9951365/). Scalable, privacy-preserving, [increasingly the default](https://pubmed.ncbi.nlm.nih.gov/39603900/) for research access to NHS records.

[Taiwan's national health system uses federated learning](https://pubmed.ncbi.nlm.nih.gov/37822805/). The model goes to the data instead of the data going to the model. Privacy preserved, outcomes improved, training data that reflects the population it serves.

The US? [University of Florida](https://pubmed.ncbi.nlm.nih.gov/40557342/) just started utilizing both.

**Three Tools, Different Jobs-**

***Synthetic data*** generates fake patients who don't exist but who collectively mirror the patterns of real data. Useful because synthetic patients can't be re-identified and reproduce real-data distributions with high fidelity.

***Federated learning*** sends the model to the data. Hospitals train locally, return only the weights. Records never leave the building.

***Boosting*** is different - it's a training technique, not a privacy technique. You can reweight underrepresented groups during training so the model doesn't treat them as noise.

**The Question I Keep Sitting With**- If AI training data comes from a system that already underserves certain populations, will the synthetic version fix the gap or reproduce it? Is it humane?

**Synthetic data is downstream of real data.** If your dataset underrepresents certain populatoins, the synthetic patients you generate will reflect the same gap. Higher resolution of the same incomplete picture.

Boosting can help. But you can only boost groups that are in the data. You can't boost what was never collected. You can't reweight someone who never made it into the system.

The math assumes the dataset represents the patient population, and when it doesn't, the math gives you confident outputs anyway. The confidence is the problem.

**Who's Missing**- The people most likely to be missing from US health datasets are the people most likely to fall through other systems too: uninsured adults, undocumented immigrants, rural patients, people whose first encounter with the medical system happens in an ER and stops there.

Meanwhile, the over-represented patients are wealthier, whiter, more urban, with longitudinal records that AI models love. Generating synthetic data from this distribution scales up the demographics of who already had access.

One fall shouldn't be the difference between keeping your house or your arm. The AI tools we're building on top of this system should at minimum not make the gap worse. That's a low bar. Most tooling clears it only on a curve.

**What a Real Framework Looks Like**- Federated learning, synthetic data, and boosting aren't competing techniques. With honest accounting of who's absent and why, they start to look like a framework:

Federated learning trains across institutions whose patients aren't in centralized datasets - community clinics, rural hospitals, FQHCs — without records leaving the building.
Synthetic data augments thin slices of real data without re-identification risk.
Boosting ensures the model learns from underrepresented groups instead of treating them as noise.

Honest accounting asks, before training, who is in this dataset and who isn't. Documents the answer. Reports performance disaggregated by subpopulation.

The first three are mature. The fourth is institutional practice, and institutional practice in US health AI is, charitably, uneven.

A model with 94% aggregate accuracy can have 78% accuracy on the 4% subgroup. The aggregate says ship it. The disaggregated says don't.

The math isn't the bottleneck. The will to look at who's absent, and act like their absence matters, is the bottleneck.



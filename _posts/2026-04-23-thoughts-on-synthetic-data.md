---
layout: post
title: "You Can't Boost What Was Never Collected"
date: 2026-04-23
tags: [data-science, fairness, healthcare]
excerpt: "There's AI now at Burger King. Can we talk about what that means for American healthcare for a second?"
---

There's AI now at Burger King. A model can be 94% accurate and still be 78% accurate on you, depending on who you are. At Burger King, that's the difference between beef and chicken. In healthcare, it's the difference between catching the tumor and missing it.

Can we talk about AI in American healthcare for a second?

**Three Tools, Different Jobs-**

***Synthetic data*** generates fake patients who don't exist but who collectively mirror the patterns of real data. Useful because synthetic patients can't be re-identified and reproduce real-data distributions with high fidelity.

***Federated learning*** sends the model to the data. Hospitals train locally, return only the weights. Records never leave the building.

***Boosting*** is different - it's a training technique, not a privacy technique. You can reweight underrepresented groups during training so the model doesn't treat them as noise.

**The Question I Keep Sitting With**- If AI training data comes from a system that already underserves certain populations, will the synthetic version fix the gap or reproduce it? Is it humane?

**Synthetic data is downstream of real data.** If your dataset underrepresents certain populations, the synthetic patients you generate will reflect the same gap. Higher resolution of the same incomplete picture.

Boosting can help. But you can only boost groups that are in the data. You can't boost what was never collected. You can't fix structural racism with a boosted dataset.

**Who's Missing**- The people most likely to be missing from US health datasets are the people most likely to fall through other systems too: uninsured adults, undocumented immigrants, rural patients, people whose first encounter with the medical system happens in an ER and stops there.

The patients who are well-represented are wealthier, whiter, more urban, with longitudinal records that AI models love. Generating synthetic data from this distribution scales up the demographics of who already had access. Higher fidelity of a narrower picture.

One fall shouldn't be the difference between keeping your house or your arm. The AI tools we're building on top of this system should at minimum not make the gap worse. That's a low bar. Most tooling clears it only on a curve.

**The Bottleneck**- A model with 94% aggregate accuracy can have 78% accuracy on the 4% subgroup. The aggregate says ship it. The disaggregated says don't.

The math isn't the bottleneck. To look at who's absent and act like their absence matters, are the real calculations needed.

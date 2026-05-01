---
layout: post
title: Algorithmic Fairness Explained
date: 2026-05-01
tags: [data science, algorithmic fairness]
excerpt: A field that sits at the intersection of machine learning, ethics, law, and statistics.
---

Algorithmic fairness is the field concerned with whether automated decision-making systems produce systematically unfair outcomes for different groups of people, usually groups defined by attributes like race, gender, age, or disability. It sits at the intersection of machine learning, ethics, law, and statistics.

The core analogy I find useful: think of an algorithm as a new employee who learned the job entirely by shadowing previous decisions. If those decisions reflected biased patterns (who got loans, who got hired, whose tumors got flagged), the algorithm absorbs those patterns as "the way things are done" and scales them up. The system isn't malicious, it's just very confidently doing exactly what it was taught. Algorithmic fairness is the discipline of asking: taught by whom, on what, and with what consequences?

**Different definitions of fairness are mutually incompatible.** This is the part that surprises people new to the field. You can ask for *demographic parity* (equal positive rates across groups), *equalized odds* (equal error rates across groups), *calibration* (a 70% prediction means 70% in every group), or *individual fairness* (similar people treated similarly), but a famous result by Kleinberg, Chouldechova, and others shows you generally cannot satisfy all of these at once when base rates differ between groups. So fairness work is partly technical and partly normative: you have to choose which kind of fairness matters for the context.

**Bias enters at many points, not just "the data."** Historical bias is the obvious one, but there's also representation bias (some groups underrepresented in training data), measurement bias (your proxy variable, like arrest rates as a stand-in for crime, is itself biased), aggregation bias (one model treating heterogeneous groups as uniform), and deployment bias (a model used in a context different from where it was validated). 

**Mitigation happens at three points in the pipeline:** pre-processing (reweighting or augmenting training data, like the boosting and synthetic data interventions I've been working on for EquiScan), in-processing (building fairness constraints directly into the loss function), and post-processing (adjusting decision thresholds per group after the model is trained). Each has different legal and ethical implications. Post-processing, for instance, often requires using protected attributes at decision time, which is restricted in some domains.

The field's intellectual tension, and what makes it interesting, is that "fair" is not a property you can verify the way you verify accuracy. It's a claim about values, and the math forces you to be specific about which values you're prioritizing. 

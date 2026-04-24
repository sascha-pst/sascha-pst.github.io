# Krama: A Constraint-Aware Yoga Sequence Generator

**Product Requirements Document — v0.1 (Draft)**

**Author:** Sasha T. Schaps
**Status:** Draft for review
**Last updated:** April 2026

---

## 1. TL;DR

Krama is a yoga sequence generator that treats sequencing as a constraint satisfaction problem rather than a content retrieval problem. Given user-specified parameters — duration, level, focus area, peak pose, and energetic intent — it produces structurally sound practice sequences that respect the pedagogical principles working teachers actually use: arc (warmup → standing → peak → cooldown → savasana), counter-posing, bilateral balance, and safe transitions.

The project ships as a portfolio piece with three artifacts: a curated and structured pose dataset, a comparative implementation of two sequencing algorithms (graph-based and templated CSP), and a public-facing web tool. A methodology writeup documents evaluation rigor and the explicit choices made around cultural attribution and lineage.

The name *krama* (क्रम) is the Sanskrit term for "sequence," "order," or "step" — used in classical yoga texts to describe the deliberate progression of a practice.

---

## 2. Background and motivation

Existing yoga technology — Down Dog, Asana Rebel, Glo, YouTube class libraries — solves the wrong problem well. These products treat sequencing as content retrieval: surface a pre-built class that matches user filters. The hard problem, the one teachers actually spend time on when planning, is constructing a sequence from scratch under simultaneous constraints. A safe, intelligent sequence requires:

- **Arc:** energy must rise and fall along a recognizable curve.
- **Counter-posing:** a deep backbend without a subsequent neutralizing pose risks injury.
- **Bilateral symmetry:** poses performed on one side must be mirrored.
- **Transition logic:** moving from a standing pose to a deep seated forward fold without intermediate poses is jarring at best and unsafe at worst.
- **Difficulty pacing:** peak poses must be earned by appropriate preparation.

These are tractable as formal constraints. They are not, however, captured by recommendation systems trained on engagement data, because the optimization target ("user completes the class") is a poor proxy for sequence quality.

Krama makes the constraints explicit, encodes them in a generator, and evaluates the output against criteria a qualified yoga teacher would actually use.

---

## 3. Goals and non-goals

### Goals

1. Produce sequences that respect domain constraints (arc, counter-posing, bilateral balance, transitions, difficulty pacing).
2. Compare two algorithmic approaches — graph traversal and templated constraint satisfaction — and document tradeoffs honestly.
3. Provide a usable web interface for generating, editing, and exporting sequences.
4. Establish a defensible evaluation methodology with both quantitative metrics and qualitative review.
5. Address cultural attribution and representation explicitly in the documentation.

### Non-goals

1. Mobile-native application (web-first; mobile-responsive is sufficient for v1).
2. Video instruction or live class delivery.
3. User accounts, cloud persistence, or social features (sequences are session-local in v1; export-to-PDF satisfies the persistence need).
4. Therapeutic or rehabilitative claims. Krama is a planning aid, not a medical tool.
5. Comprehensive coverage of every yoga lineage. Scope is constrained to a vinyasa-influenced hatha vocabulary documented in section 7.

---

## 4. Users and use cases

### Primary persona (v1): Portfolio reviewer

A hiring manager, PhD admissions reader, or technical reviewer evaluating Sasha's data science and product capabilities. Cares about: rigor of the modeling choice, quality of the writeup, evidence of evaluation discipline, and the depth of domain reasoning.

### Secondary personas (informing design, not v1 targets)

- **Yoga teacher planning a class.** Needs to generate a starting draft that they will edit.
- **Intermediate self-practitioner.** Wants a varied home practice that doesn't require choreographing from scratch.

### Core use cases

- *Generate a sequence from parameters.* "60 minutes, intermediate, hip-focused, peak pose Eka Pada Rajakapotasana, cooling energy."
- *Inspect why a sequence was constructed.* Each pose displays its role (warmup, peak preparation, counter-pose, etc.).
- *Edit and reorder.* Drag-and-drop reordering, swap poses, with constraint violations flagged in real time.
- *Export.* PDF for printing or sharing; URL-encoded state for shareable links.

---

## 5. Functional requirements

| ID | Requirement | Priority |
|----|----|----|
| FR-1 | System accepts user inputs: duration (15–90 min), level (beginner/intermediate/advanced), focus area, optional peak pose, energetic intent (heating/cooling/neutral). | Must |
| FR-2 | System generates a sequence satisfying defined constraints (see section 8) or returns a structured failure indicating which constraint could not be satisfied. | Must |
| FR-3 | Each pose in the output includes: Sanskrit IAST name, English name, role in sequence, suggested duration or breath count, and image or line drawing. | Must |
| FR-4 | User can reorder, remove, or substitute poses. Constraint violations introduced by edits are surfaced inline. | Must |
| FR-5 | User can export the sequence as a PDF and as a shareable URL with state encoded in query params. | Must |
| FR-6 | User can toggle between two underlying algorithms and compare outputs for the same inputs. | Should |
| FR-7 | System provides a read-only browse view of the full pose library with filtering. | Should |
| FR-8 | Sequence generation is deterministic given a seed; users can request alternative sequences for the same parameters. | Should |
| FR-9 | Documentation page explains the methodology, dataset construction, and cultural attribution choices. | Must |

---

## 6. Non-functional requirements

- **Performance.** Sequence generation completes in under 500ms on a modern laptop browser for sequences up to 90 minutes. Algorithms run client-side; no backend round-trip required.
- **Accessibility.** WCAG 2.1 AA compliance. Keyboard navigation for reordering. Screen reader announces pose names and sequence position.
- **Data integrity.** Pose data is version-controlled, human-readable (YAML), and validated against a schema on every commit.
- **Reproducibility.** Algorithms, dataset, and evaluation notebooks are open-source under a permissive license. Results in the writeup are reproducible from the repository.
- **Hosting.** Static site, no backend. Deployable to GitHub Pages.

---

## 7. Data model

The pose dataset is the foundation of the project. Schema decisions cascade into every algorithmic and UI decision downstream, so the schema is designed before the algorithms.

### Schema (per pose)

```yaml
id: string                        # stable slug, e.g. "adho_mukha_svanasana"
sanskrit_iast: string             # "Adho Mukha Śvānāsana"
sanskrit_devanagari: string       # "अधोमुख श्वानासन"
english: string                   # "Downward-Facing Dog"
category: enum                    # standing | seated | supine | prone | inversion |
                                  # backbend | forward_fold | twist | balance | restorative
difficulty: int                   # 1 (beginner) to 5 (advanced)
body_parts_engaged: [string]      # controlled vocabulary
body_parts_stretched: [string]
energy_effect: enum               # heating | cooling | neutral
contraindications: [string]       # "wrist injury", "high blood pressure", "pregnancy_3rd_trimester"
props_optional: [string]
props_required: [string]
valid_predecessors: [pose_id]     # transitions IN
valid_successors: [pose_id]       # transitions OUT
counter_poses: [pose_id]          # poses that neutralize this one
preparation_for: [pose_id]        # peak poses this prepares
typical_duration_breaths: int     # held duration in breaths
bilateral: bool                   # must be performed on both sides
sources: [citation]               # textual lineage references
notes: string
```

### Initial scope

~60–80 poses spanning a vinyasa-influenced hatha vocabulary. Coverage is depth-over-breadth: better to have 70 poses with rich, accurate transition metadata than 300 poses with shallow attributes.

### Editorial principles

- Sanskrit names are primary; English names are secondary. Both are searchable.
- IAST diacritics are preserved in display.
- Where Western popularizations differ from traditional naming, both are documented and the divergence is annotated.
- Contraindications are conservative. The dataset errs on the side of flagging more, not fewer.

---

## 8. Technical approach

### 8.1 Sequencing as constraint satisfaction

The sequencing problem is formalized as: produce an ordered list of poses **P = [p₁, p₂, …, pₙ]** of total duration **T ± ε** such that all constraints **C** are satisfied. Constraints fall into four families:

- **Structural** (the arc): the sequence must contain warmup, standing, peak window, cooldown, and savasana segments in order, with segment durations within target ranges.
- **Local transition** (pose-to-pose): each consecutive pair (pᵢ, pᵢ₊₁) must appear in the valid transitions graph.
- **Compositional** (sequence-wide): bilateral poses must be mirrored; backbends must be followed within k poses by a counter-pose; peak poses must be preceded by adequate preparation.
- **User-specified**: duration, level cap, focus area emphasis, peak pose, energetic profile.

### 8.2 Approach A — Graph traversal

Poses are nodes. Edges are valid transitions, weighted by transition cost (energetic shift, difficulty delta, prop changes). The generator finds a path satisfying the constraints, optionally optimizing for diversity or transition smoothness.

- **Implementation:** Python, NetworkX. Algorithms: constrained pathfinding via modified Dijkstra; for harder constraint sets, beam search.
- **Strengths:** transitions are first-class; novel sequences emerge naturally; the model corresponds to how teachers actually think about flow.
- **Weaknesses:** structural constraints (the arc) are hard to express in pure graph terms and require post-hoc segmentation; risk of producing locally smooth but globally aimless sequences.

### 8.3 Approach B — Templated CSP

The sequence is decomposed into slots corresponding to arc segments. Each slot has a target duration and a candidate pool. Poses are assigned to slots subject to constraints, then ordered within slots subject to local transition rules.

- **Implementation:** Python, `python-constraint` or hand-rolled backtracking. Within-slot ordering uses the same transition graph as approach A.
- **Strengths:** structural constraints are guaranteed by construction; easy to reason about; outputs are pedagogically defensible.
- **Weaknesses:** sequences can feel formulaic; less novelty; slot boundaries can produce awkward transitions across segments.

### 8.4 Comparison

The writeup includes a head-to-head comparison on identical inputs across multiple parameter combinations, with both quantitative metrics (constraint satisfaction rate, diversity, transition cost) and qualitative review. The honest finding will likely be that *neither dominates* — that approach B is more reliable but approach A produces more interesting sequences when it succeeds. Documenting this tradeoff candidly is more valuable than claiming either as a winner.

### 8.5 Stack

- **Backend logic:** Python 3.11, NetworkX, Pandas, Pydantic for schema validation.
- **Data:** YAML files, one per pose, validated against a JSON schema in CI.
- **Frontend:** React (Vite). Tailwind for styling. The Python algorithms are ported to TypeScript for client-side execution; the Python implementation remains canonical and is used in evaluation notebooks.
- **Hosting:** GitHub Pages for the site; the dataset and notebooks live in the same repository.

---

## 9. Evaluation methodology

Evaluation is the differentiator of this project. The methodology mirrors the rigor used in EquiScan: define metrics in advance, sample systematically, evaluate both quantitatively and qualitatively, and report failures honestly.

### Quantitative metrics

- **Constraint satisfaction rate** across all defined constraints, per algorithm.
- **Bilateral balance error**: count of unmirrored poses.
- **Counter-pose latency**: number of poses between a backbend and its first counter-pose.
- **Transition cost**: sum of edge weights along the sequence.
- **Diversity index**: how often the same pose is selected across N runs with the same parameters.

### Qualitative evaluation

A stratified sample of 50 generated sequences, varied across all input dimensions, is reviewed by Sasha as a credentialed yoga teacher using a structured rubric covering safety, pedagogical coherence, and aesthetic quality. Each sequence is rated on a 1–5 Likert scale per criterion with written rationale. Inter-rater reliability is established by having a second qualified teacher rate a 10-sequence subset.

### Comparative baseline

A naive baseline — random pose selection within duration budget, ignoring all constraints — is generated and rated alongside the algorithmic outputs to establish a floor. Optionally, sequences from a popular commercial app are rated using the same rubric for an upper-bound reference.

### Failure analysis

Every constraint violation in the sample is logged, categorized, and discussed in the writeup. The goal is not to demonstrate a flawless system — it is to demonstrate that the author can rigorously characterize where and why a system fails.

---

## 10. Cultural attribution and representation

Yoga's commercialization in the West has consistently elided its origins, simplified its pedagogy, and detached its practices from the traditions that produced them. A sequencing tool built without addressing this is, at minimum, an incomplete product. Krama makes the following editorial commitments, documented publicly:

- **Sanskrit primacy.** Pose names are stored and displayed in IAST and Devanagari. English names appear secondarily.
- **Lineage citation.** Where a pose has documented textual origin (e.g., *Hatha Yoga Pradipika*, Iyengar's *Light on Yoga*), the citation is included in the dataset.
- **Scope honesty.** The vocabulary is explicitly described as "vinyasa-influenced hatha as practiced in late-20th-century North American studios." The dataset does not claim coverage of regional traditions, devotional practices, or therapeutic systems it does not actually represent.
- **Limitations section.** The writeup includes an explicit discussion of what is lost when yoga is reduced to constraint satisfaction over a pose library.

This is not a disclaimer. It is a position. The project's credibility depends on being honest about what it is and what it isn't.

---

## 11. Risks and open questions

- **Dataset construction is the long pole.** Producing 70 well-attributed poses with accurate transition metadata is the largest time investment. Mitigation: scope to 40 poses for v0, expand iteratively.
- **The TypeScript port may diverge from the Python canonical.** Mitigation: shared test fixtures; CI runs equivalence tests.
- **Evaluation is single-rater.** Mitigation: published rubric, second-rater subset, transparent acknowledgment in the writeup.
- **Open question: licensing of pose imagery.** Line drawings are preferable to photographs both ethically (no real human likeness rights to navigate) and aesthetically (cleaner UI). Decision deferred to v0 design phase.
- **Open question: should energy effect be one-dimensional?** Real practice distinguishes more than heating/cooling — sthira/sukha, grounding/expansive, etc. Tradeoff: richer model vs. interpretability. v1 stays one-dimensional; v2 may revisit.

---

## 12. Phases and milestones

| Phase | Deliverable | Target |
|----|----|----|
| v0 — Foundation | 40-pose dataset, schema, validation, repo scaffolding | Week 2 |
| v0.5 — Algorithms | Approach A and B implemented, both passing constraint tests on a fixture set | Week 4 |
| v0.7 — Evaluation | 50-sequence evaluation completed, results documented | Week 6 |
| v1.0 — Public | Web UI, exports, public site, full writeup published | Week 8 |
| v1.1 — Polish | Pose library expanded to 70, accessibility audit, second-rater evaluation | Week 10 |

---

## 13. Success criteria

This is a portfolio project, so success is defined relative to that audience.

- A reviewer can read the writeup in under 20 minutes and clearly articulate the modeling decision and its tradeoffs.
- A reviewer can generate three sequences in the live tool and observe both algorithms' behavior on identical inputs.
- The repository is organized such that a reviewer who clones it can reproduce the evaluation notebook results without manual setup beyond `pip install -r requirements.txt`.
- The cultural attribution section is substantive enough that a reader from an information science or critical-theory background recognizes it as a position rather than a disclaimer.

A successful Krama is a project that prompts a reviewer to ask a follow-up question about the methodology — not one that prompts them to nod and move on.

---

## 14. Appendix

### A. Glossary
- **Asana**: physical posture.
- **Krama**: sequence, order, step.
- **IAST**: International Alphabet of Sanskrit Transliteration.
- **Vinyasa**: a style of yoga linking poses through breath and movement; also refers to a specific transitional sequence (chaturanga → upward dog → downward dog).

### B. Out-of-scope features for future consideration
- Pranayama (breathwork) integration as sequence framing.
- Multi-day program generation.
- User accounts and saved sequences.
- Audio cueing for live practice.
- Adaptive difficulty based on user feedback.

### C. References (to be expanded)
- Iyengar, B.K.S. *Light on Yoga.*
- Svatmarama. *Hatha Yoga Pradipika.*
- Singleton, M. *Yoga Body: The Origins of Modern Posture Practice.*
- [Algorithmic references — NetworkX docs, CSP literature — to be added during implementation]

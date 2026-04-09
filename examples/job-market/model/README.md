# Job Market Trust Infrastructure — Data Model

This **xFrame** data model (JSON fragments) implements the architecture described in [“The Architecture of Hiring Truth”](https://substack.com/home/post/p-184931834) by Sarah Trumble.

## Overview

The model supports structured, verifiable hiring data that can power several interface metaphors:

- **Trust Stock Market** — Trends, volatility, accountability-style metrics  
- **Google Maps of Hiring** — Routes, bottlenecks, alternatives  
- **Wikipedia of Job Hunting** — Collective knowledge and lived experience  
- **Simple Signals** — Short go / no-go style summaries  

All of these read from the same underlying layer: the “cathedral and stained glass” idea—one body of truth, many presentations.

## Model structure

The job-market model **extends** the shared **Market Catalyst core** entities with hiring-specific ones.

Fragments use the **type container** shape expected by strict xFrame tooling (`type.primitive`, `type.array.entity`, `foreignKeys` inside `type`, and so on).

```
market-catalyst/
├── core/model/                    # Shared, market-agnostic fragments
│   ├── company.json
│   └── vouch.json
│
└── examples/job-market/model/     # Job-market fragments
    ├── model -> ../../../core/model   # Symlink (see consolidation note below)
    ├── application.json
    ├── application_timeline.json
    ├── job_posting.json
    ├── personal_vouch.json
    ├── promise.json
    ├── review.json
    └── verification.json
```

**Consolidation note:** The Node **xframe-consolidate** walker loads `*.json` recursively but **skips subdirectories named `model`** (and `output`). The `model/` symlink is still useful for editors and docs, but the consolidator will **not** pick up `core/model` through it. For a full merge, copy **`core/model/*.json`** and **`examples/job-market/model/*.json`** into a **flat** directory and pass that as `--model-dir` (see [Usage](#usage)).

Sample input data for the example lives at [`../data/high-gravity-anchor.json`](../data/high-gravity-anchor.json).

## Architecture layers

### Layer 1: Trust data (the sunlight)

#### Core entities (generic)

- **Company** (`core/model/company.json`) — Organization record (name, domain, industry, location) without vertical-specific ties.  
- **Vouch** (`core/model/vouch.json`) — Generic trust-chain row: subject ↔ source, claim type, reputation signals, validity and revocation, optional evidence link.

#### Job-market entities

- **Job posting** — Listing and advertised terms.  
- **Application** — Submission and links to timeline and reviews.  
- **Application timeline** — Discrete events (responses, interviews, ghosting, offers, …).  
- **Promise** — Advertised commitments (salary band, response time, …).  
- **Review** — Structured scores: transparency, experiential respect, time efficiency.  
- **Personal vouch** — Job-market vouch tied to a posting, optional link to core `vouch` for weighting.  

### Layer 2: Verification and anti-gamification (the prism)

- **Verification** — Cross-checks, manipulation risk, evidence weighting.

### Layer 3: Interfaces (the stained glass)

UIs and demos consume consolidated data; they are not defined in these fragments.

## Entity relationships

```
company (core)
  ├── job_postings
  │     ├── applications
  │     │     └── timeline
  │     ├── promises
  │     └── personal_vouches
  │           └── may reference vouch (core)
  └── reviews
        └── verification
```

## Design principles

### Structured, not free-text

Prefer verifiable fields and enums over narrative-only reviews, for example:

- “Applied Jan 15”, “First response Jan 18”, “Ghosted after second interview”, “Offer Feb 1, below advertised band”  
- Not: “This company is terrible” as the sole signal  

### Three trust dimensions (reviews)

1. **Transparency** (`transparency_score`) — Promises vs reality, timelines.  
2. **Experiential respect** (`respect_score`) — Communication and dignity.  
3. **Time efficiency** (`efficiency_score`) — Effort vs outcome.  

### Verifiable timeline events

Typed events (enums), dates or datetimes, promise alignment where relevant, derived delays where the model allows.

### Trust chain (vouching)

Weighted by source signals (`source_seniority`, `source_activity_index`, `vouch_weight`), bounded in time (`valid_from` / `valid_until`), revocable (`revocation_digest`, etc.), with optional `evidence_link`. **Personal vouch** adds job-market context (e.g. `voucher_relationship`) on top of that pattern.

### Anti-gamification

Verification supports cross-reference, weighting, manipulation hints, and balancing anonymity with accountability.

## Example data shape (JSON)

Nested rows that are **already under** a parent (e.g. `promises` inside a `job_posting`) should **not** repeat the parent foreign key (`job_posting_id`); the consolidator infers it and will warn if it is duplicated.

```json
{
  "company": [
    {
      "company_id": "acme-corp",
      "company_name": "Acme Corporation",
      "domain": "acme.com",
      "industry": "Technology",
      "job_postings": [
        {
          "job_posting_id": "acme-eng-001",
          "company_id": "acme-corp",
          "job_title": "Senior Software Engineer",
          "advertised_salary_min": 120000,
          "advertised_salary_max": 150000,
          "posted_date": "2026-01-15",
          "applications": [
            {
              "application_id": "app-001",
              "job_posting_id": "acme-eng-001",
              "submitted_date": "2026-01-20",
              "timeline": [
                {
                  "timeline_event_id": "event-001",
                  "application_id": "app-001",
                  "event_type": "First Response",
                  "event_date": "2026-01-22",
                  "was_promise_kept": true
                },
                {
                  "timeline_event_id": "event-002",
                  "application_id": "app-001",
                  "event_type": "Ghosted",
                  "event_date": "2026-02-10"
                }
              ]
            }
          ],
          "promises": [
            {
              "promise_id": "promise-001",
              "promise_type": "Response Timeline",
              "promise_text": "We'll respond within 2 weeks",
              "promised_timeline_days": 14,
              "was_kept": true
            }
          ],
          "personal_vouches": [
            {
              "vouch_id": "vouch-001",
              "job_posting_id": "acme-eng-001",
              "source_identity": "github:alice-dev",
              "claim_type": "EXISTENCE",
              "source_seniority": 1825,
              "source_activity_index": 1250,
              "vouch_weight": 0.95,
              "valid_from": "2026-01-15",
              "voucher_relationship": "Current Employee",
              "confidence_level": 5
            }
          ]
        }
      ],
      "reviews": [
        {
          "review_id": "review-001",
          "company_id": "acme-corp",
          "application_id": "app-001",
          "review_date": "2026-02-11",
          "transparency_score": 4,
          "respect_score": 2,
          "efficiency_score": 1,
          "was_ghosted": true,
          "go_nogo_signal": "NO-GO",
          "verification": [
            {
              "verification_id": "verify-001",
              "review_id": "review-001",
              "verification_date": "2026-02-11",
              "verification_method": "Cross-Reference",
              "is_consistent": true,
              "verifiability_weight": 0.9,
              "manipulation_risk_score": 0.1
            }
          ]
        }
      ]
    }
  ]
}
```

## Usage

### Consolidate (Node, JSON)

Use the **xframe-consolidate** bundle (Node 18+). If you use Cursor, a typical path is:

`~/.cursor/skills/xframe-consolidate/scripts/consolidate.min.js`

Set `CONSOLIDATE_JS` to your actual `consolidate.min.js` path, then from the **repository root**:

```bash
CONSOLIDATE_JS="${CONSOLIDATE_JS:-$HOME/.cursor/skills/xframe-consolidate/scripts/consolidate.min.js}"
MERGE_DIR=examples/job-market/.xf-model-merge

rm -rf "$MERGE_DIR"
mkdir -p "$MERGE_DIR"
cp core/model/*.json examples/job-market/model/*.json "$MERGE_DIR/"

node "$CONSOLIDATE_JS" \
  examples/job-market/data \
  --model-dir "$MERGE_DIR" \
  --note "Job Market Trust Infrastructure — merge core + job-market JSON models" \
  --author "Market Catalyst - Job Market" \
  --git-commit-hash "$(git rev-parse HEAD)" \
  --js

rm -rf "$MERGE_DIR"
```

**Outputs** (under `examples/job-market/output/`):

- `consolidated.schema.json` — merged JSON Schema (`$defs` per entity)  
- `consolidated_data.json` — nested data, metadata, and `change`  
- Optional: `consolidated.schema.js`, `consolidated_data.js` when `--js` is set  
- `consolidation_log.txt` — step log  

Pass `--close-fk-enums` if you want foreign-key fields in the schema tightened to primary keys present in the loaded dataset (see xframe-consolidate documentation).

### Model files

**Core**

- `core/model/company.json`  
- `core/model/vouch.json`  

**Job market**

- `job_posting.json`  
- `application.json`  
- `application_timeline.json`  
- `promise.json`  
- `review.json`  
- `personal_vouch.json`  
- `verification.json`  

## Alignment with the article

- Data-first hiring truth  
- Three layers: data, verification, interface  
- Structured events instead of-only narrative  
- Transparency, respect, efficiency  
- Anti-gamification and cross-checks  
- Multiple views on one dataset  
- Trust chain via vouching  

## Core vs market-specific

- **`core/model/`** — Reusable across verticals (company, vouch).  
- **`examples/job-market/model/`** — Hiring-specific entities and relationships referencing core types.  

That split keeps shared trust mechanics in one place while allowing market-specific extensions.

## Future enhancements

- Demographic-aware community views  
- Industry-specific metrics  
- Geographic routing data for map-style views  
- Time-series aggregates for “market”-style dashboards  
- Community contribution tracking  
- More shared core entities where several markets need the same shape (e.g. review, verification)

# Job Market Trust Infrastructure - Data Model

This xFrame YAML model implements the data architecture described in ["The Architecture of Hiring Truth"](https://substack.com/home/post/p-184931834) by Sarah Trumble.

## Overview

This model supports structured, verifiable data about hiring processes that can power multiple interface views:
- **Trust Stock Market** - Trends, volatility, accountability metrics
- **Google Maps of Hiring** - Routes, bottlenecks, alternatives
- **Wikipedia of Job Hunting** - Collective knowledge, lived experience
- **Simple Signals** - Yelp-style go/no-go signals

All views are powered by the same underlying data layer, following the "cathedral and stained glass windows" metaphor: the same sunlight (truth) streams through different windows (interfaces).

## Model Structure

This job-market model extends the **core Market Catalyst models** with job-market specific entities:

```
market-catalyst/
├── core/model/              # Generic, market-agnostic entities
│   ├── company.yaml         # Generic company/organization entity
│   └── vouch.yaml           # Generic vouch entity (Trust Chain)
│
└── examples/job-market/model/  # Job-market specific entities
    ├── core -> ../../../core/model  # Symlink to core models
    ├── job_posting.yaml
    ├── application.yaml
    ├── application_timeline.yaml
    ├── promise.yaml
    ├── review.yaml
    ├── personal_vouch.yaml   # Extends core vouch
    └── verification.yaml
```

The `core/` symlink allows the consolidator to access core entities when processing job-market models.

## Architecture Layers

### Layer 1: Trust Data Layer (The Sunlight)

The foundational layer of structured, verifiable events:

#### Core Entities (Generic, Market-Agnostic)

- **Company** (`core/model/company.yaml`) - Generic company/organization entity
  - Basic company information (name, domain, industry, location)
  - No market-specific relationships

- **Vouch** (`core/model/vouch.yaml`) - Generic vouch entity for conditional transfer of reputation
  - **Subject-Source Link**: `subject_id` (thing being vouched for) + `source_identity` (GitHub UID/Public Key)
  - **Claim Types**: EXISTENCE, INTEGRITY, TERMS
  - **Reputation Weighting**: `source_seniority`, `source_activity_index`, `vouch_weight`
  - **Conditional Guarantee**: `valid_from`, `valid_until`, `revocation_digest`
  - **Evidence**: `evidence_link` to commits/files/external proof

#### Job-Market Specific Entities

- **Job Posting** - Job listings with advertised details
- **Application** - Application submissions
- **Application Timeline** - Verifiable events (responses, interviews, ghosting, offers)
- **Promise** - Promises made (salary ranges, timelines, process steps)
- **Review** - Structured reviews based on three dimensions:
  - **Transparency** (were promises kept?)
  - **Experiential Respect** (was humanity honored?)
  - **Time Efficiency** (was effort proportional to outcome?)
- **Personal Vouch** - Extends core vouch with job-market specific fields
  - References `job_posting_id` (subject)
  - Adds job-market relationship context (`voucher_relationship`)
  - Includes all core vouch reputation and revocation features

### Layer 2: Verification & Anti-Gamification Layer (The Prism)

- **Verification** - Cross-verification, manipulation detection, evidence weighting

### Layer 3: Interface Layer (The Stained Glass)

The same verified data can be presented as different views (implemented in application layer, not in this model).

## Entity Relationships

```
company (core)
  ├── job_postings (one-to-many)
  │     ├── applications (one-to-many)
  │     │     └── timeline (one-to-many)
  │     ├── promises (one-to-many)
  │     └── personal_vouches (one-to-many)
  │           └── references vouch (core) for reputation weighting
  └── reviews (one-to-many)
        └── verification (one-to-many)
```

## Key Design Principles

### Structured, Not Free-Text

Unlike traditional review platforms, this model emphasizes **structured, verifiable events** rather than free-text reviews:

- ✅ "Applied Jan 15"
- ✅ "First response Jan 18"
- ✅ "Ghosted after second interview"
- ✅ "Offer received Feb 1 with 10% below advertised range"
- ❌ Not: "This company is terrible" (free-text)

### Three Dimensions of Trust

Reviews are structured around three dimensions:

1. **Transparency** (`transparency_score`) - Were promises kept? Were timelines accurate?
2. **Experiential Respect** (`respect_score`) - Was humanity honored? Was communication respectful?
3. **Time Efficiency** (`efficiency_score`) - Was effort proportional to outcome?

### Verifiable Events

Timeline events are structured with:
- Event types (enum): Application Submitted, First Response, Screening Call, Technical Interview, Offer Extended, Ghosted, etc.
- Dates and timestamps
- Promise fulfillment tracking
- Response time calculations

### Trust Chain (Vouching)

The core vouch entity implements a **conditional transfer of reputation**:

- **Reputation Weighting**: Vouches are weighted by source seniority and activity
  - `source_seniority`: Account age (e.g., GitHub account age in days)
  - `source_activity_index`: Historical proof of work (commits/contributions)
  - `vouch_weight`: Final force applied to Market Gravity

- **Conditional Guarantee**: Time-based validity with revocation
  - `valid_from` / `valid_until`: Time-based validity windows
  - `revocation_digest`: Cryptographic revocation mechanism
  - If voucher discovers the originator lied, they can issue a revocation that immediately flips the go_nogo_signal

- **Evidence-Based**: `evidence_link` references commits, files, or external proof

The job-market `personal_vouch` extends this core concept with market-specific relationship context while maintaining all reputation and revocation features.

### Anti-Gamification

The verification entity supports:
- Cross-referencing for consistency
- Evidence weighting
- Manipulation detection
- Anonymity + accountability balance

## Example Data Structure

```yaml
company:
  - company_id: "acme-corp"
    company_name: "Acme Corporation"
    domain: "acme.com"
    industry: "Technology"
    
    job_postings:
      - job_posting_id: "acme-eng-001"
        job_title: "Senior Software Engineer"
        advertised_salary_min: 120000
        advertised_salary_max: 150000
        posted_date: "2026-01-15"
        
        applications:
          - application_id: "app-001"
            submitted_date: "2026-01-20"
            
            timeline:
              - timeline_event_id: "event-001"
                event_type: "First Response"
                event_date: "2026-01-22"
                was_promise_kept: true
              - timeline_event_id: "event-002"
                event_type: "Ghosted"
                event_date: "2026-02-10"
        
        promises:
          - promise_id: "promise-001"
            promise_type: "Response Timeline"
            promise_text: "We'll respond within 2 weeks"
            promised_timeline_days: 14
            was_kept: true
        
        personal_vouches:
          - vouch_id: "vouch-001"
            job_posting_id: "acme-eng-001"
            source_identity: "github:alice-dev"
            claim_type: "EXISTENCE"
            source_seniority: 1825  # 5 years
            source_activity_index: 1250  # commits
            vouch_weight: 0.95
            valid_from: "2026-01-15"
            voucher_relationship: "Current Employee"
            confidence_level: 5
    
    reviews:
      - review_id: "review-001"
        application_id: "app-001"
        transparency_score: 4
        respect_score: 2
        efficiency_score: 1
        was_ghosted: true
        go_nogo_signal: "NO-GO"
        
        verification:
          - verification_id: "verify-001"
            verification_method: "Cross-Reference"
            is_consistent: true
            verifiability_weight: 0.9
            manipulation_risk_score: 0.1
```

## Usage

### Consolidate Models

The consolidator will automatically discover core models through the symlink:

```bash
PYTHONPATH=/path/to/xFrame/src python3 -m xframe.consolidator \
    examples/job-market/data/ \
    --model-dir examples/job-market/model/ \
    --note "Job Market Trust Infrastructure Model" \
    --author "Market Catalyst - Job Market"
```

The consolidator will process:
- All YAML files in `examples/job-market/model/`
- Core models via the `core/` symlink (`core/model/company.yaml`, `core/model/vouch.yaml`)

### Model Files

#### Core Models (Generic)
- `core/model/company.yaml` - Generic company/organization entity
- `core/model/vouch.yaml` - Generic vouch entity (Trust Chain)

#### Job-Market Models
- `job_posting.yaml` - Job posting entity
- `application.yaml` - Application entity
- `application_timeline.yaml` - Timeline events
- `promise.yaml` - Promises tracking
- `review.yaml` - Structured reviews
- `personal_vouch.yaml` - Job-market vouch (extends core vouch)
- `verification.yaml` - Verification and anti-gamification

## Alignment with Article

This model implements the architecture described in the article:

✅ **Data-First Approach** - Structured truth about hiring processes  
✅ **Three-Layer Architecture** - Data, Verification, Interface layers  
✅ **Structured Events** - Verifiable events, not free-text  
✅ **Three Dimensions** - Transparency, Respect, Efficiency  
✅ **Anti-Gamification** - Cross-verification and manipulation detection  
✅ **Multiple Views** - Same data supports all interface types  
✅ **Trust Chain** - Conditional transfer of reputation via vouching

## Core vs Market-Specific

This model follows a **separation of concerns**:

- **Core Models** (`core/model/`) - Generic, reusable entities that can be used across different market types (job market, real estate, services, etc.)
  - `company`: Generic organization entity
  - `vouch`: Generic trust chain entity

- **Job-Market Models** (`examples/job-market/model/`) - Market-specific entities that extend core concepts
  - Job-market entities reference core entities via foreign keys
  - Job-market entities add market-specific fields and relationships

This architecture allows:
- Reuse of core trust infrastructure across markets
- Market-specific extensions without duplicating core logic
- Consistent trust mechanisms (vouching, reputation) across all markets

## Future Enhancements

- Demographic-specific tracking (for Wikipedia-style community guides)
- Industry-specific metrics
- Geographic routing data (for Google Maps view)
- Time-series aggregation (for Trust Stock Market view)
- Community contribution tracking
- Additional core entities for cross-market use (e.g., review, verification)
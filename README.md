# Market-Catalyst (Core)

> *Converting Market Entropy into Human Exergy.*

**Market-Catalyst** is an open-source, GitHub-native kernel for building auditable marketplaces. It is built around integrity as the primary signal and transparency enforced by structure—not by trusting participants to self-report.

## The concept

Traditional marketplaces optimize for volume, which tends to amplify noise, asymmetry, and what we call the “Efficiency Paradox.”

Market-Catalyst treats market interactions as **audits**: **promises** from an originator are compared to **outcomes** on a public ledger, so the “market gravity” of an opportunity can be reasoned about from evidence, not vibes.

## Architecture

This repository is the **generic kernel**: industry-agnostic and intended to be sovereign-first.

### 1. Git as the ledger

Market state lives in **JSON Schema–backed** artifacts in the repo instead of a hosted database.

- **Tamper-evident:** history comes from Git.
- **Auditable:** anyone can inspect, fork, or trace blame on a record.
- **Low ops:** no database to run for a new deployment.

### 2. Vouch-based integrity

Trust is anchored in **strong identities** (e.g. GitHub UIDs in the reference design).

- **Vouches** replace anonymous engagement metrics.
- A vouch links a source identity to a concrete market claim.
- Weight can reflect durable “exergy” signals (e.g. account age, real contribution history).

### 3. Schema and data

Conceptually, the kernel reasons over four roles:

| Role | Meaning | Example in a hiring market |
|------|---------|----------------------------|
| Originator | Party making the claim | Employer / company |
| Opportunity | Unit of exchange | Job posting |
| Protocol | Verifiable timeline of the interaction | Application and timeline events |
| Attestation (vouch) | External validation of the claim | Integrity / terms vouches |

In this repo, those ideas are expressed as **xFrame** data-model fragments: JSON files under [`core/model/`](core/model/) (shared entities) plus market-specific definitions under [`examples/job-market/model/`](examples/job-market/model/). Sample records live under [`examples/job-market/data/`](examples/job-market/data/).

Consolidation (see [`examples/job-market/model/README.md`](examples/job-market/model/README.md)) produces a merged **JSON Schema** and nested **consolidated data**, e.g. [`examples/job-market/output/consolidated.schema.json`](examples/job-market/output/consolidated.schema.json) and [`examples/job-market/output/consolidated_data.json`](examples/job-market/output/consolidated_data.json).

## Franchise model

The repo is meant to be **cloned**. You specialize it for a vertical (hiring, housing, freelance, and so on) by extending the core model and shipping your own data.

**Reference implementation:** [`examples/job-market/`](examples/job-market/) — Sarah Springsteen Trumble’s *Theory of Online Market Gravity* applied to hiring transparency, promises, reviews, and verification.

## Demos

- **[Job Market Trust Infrastructure](https://exergy-connect.github.io/market-catalyst/examples/job-market/)** — Multiple views on the same underlying trust data (e.g. signals, maps-style and narrative UIs).
- **[Vouch PR demo](https://exergy-connect.github.io/market-catalyst/examples/job-market/vouch-pr-demo.html)** — Author vouches and propose them via GitHub Pull Requests without using a terminal.

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE).

We provide the activation energy; you provide the community.

---

*“We are not just watching the market collapse — we are designing the next better paradigm shift.”*

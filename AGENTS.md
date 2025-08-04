# 14 KB Portfolio “knightkill/14kb”

This file exposes:
1. A **glossary of agents** (containers + services)
2. Strict **TDD test rules**
3. **Docker Swarm** orchestration details
4. Lofty **stress-testing** expectations  
Follow this to work on all subsystems consistently with zero surprises.

---

## 1. Project overview & agents

- **web-ui** – Pure static HTML/CSS (Milligram) + Alpine.js. Built in `/frontend`, minified, ≤ 14 KB gzip.
- **api-backend** – Node.js · Express · minimalist REST API, under `/backend`, supplies data, logs, analytics.
- **rabbitmq** *(optional)* – Light message bus if events needed.
- **test-agent** – Runs testing containers, maintains strict TDD.
- **load-agent** – Runs stress/load tests on staging service.

✨ Each “agent” is a Docker Swarm service/container, as described under Docker Swarm setup.

---

## 2. Build, test, dev & deployment commands

All of these must succeed with exit‑code 0 to pass CI or code generation tools:

- `npm test` – runs tests (watcher + CI)
- `npm run lint -- --fix` – fix code style
- `npm run build:ui` – builds and minifies frontend
- `npm run build:api` – compiles or bundles the API
- `npm run stress-test` – runs all defined stress scenarios
- `docker stack deploy --with-registry-auth --prune -c swarm-stack.yml 14kb` *(after CI)*

Include these commands in `ci.yaml` or whichever pipeline definition you use. :contentReference[oaicite:1]{index=1}

---

## 3. Code style conventions

- Indentation: 2 spaces; 100 char width.
- Milligram + Alpine.js: plain `<script x-init>…</script>`
- JavaScript: no semicolons; strict `const` over `let` when immutable.
- File naming: lower‑kebab in frontend, `*.test.js` in backend.
- Never commit API keys or secrets. Use `.env.example`, enforce `.env` keys with test. :contentReference[oaicite:2]{index=2}

---

## 4. Testing & TDD

### 4.1 TDD rules

- **Write tests first** — always start a new feature with a failing test (TDD Red‑Green‑Refactor cycle). No new logic without tests. :contentReference[oaicite:3]{index=3}
- **Integrations first** — start with integration/component tests before writing units. Covers API contract, CLI, or UI through HTTP. :contentReference[oaicite:4]{index=4}
- **Minimal E2E tests** — 3 to 5, covering config, infra failures, and external dependencies.
- **Unit tests only for complex logic**, e.g. math utilities, parser, monospace conversion functions.

### 4.2 Test architecture & folders

```

/test
/unit
/integration
/stress
/scenarios
highConcurrency.yaml
slowRequests.yaml
spikes.yaml
/helpers
loadGenerator.js

````

Stress tests use **Artillery** or **k6**, stored as `.yaml` or `.js` flows. Keep this separate from `*.test.js` suites. :contentReference[oaicite:5]{index=5}

### 4.3 Monitoring & observability

- Every integration test must validate and log five backend “exit doors”: correct HTTP response, data change (DB/file), external call (stubbed), message queue events, and observability metrics (e.g. Prometheus counters). :contentReference[oaicite:6]{index=6}
- Coverage: aim for **95%+ on all non‑UI code**, measured via `nyc` or Jest in CI.

---

## 5. Docker Swarm stack design

### 5.1 swarm‑stack.yml (excerpt)

```yaml
version: "3.9"
services:
  api-backend:
    image: your-registry/14kb-api:latest
    ports: ["8080:3000"]
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "0.25"
          memory: "256M"
      update_config:
        parallelism: 1
        delay: 10s
      healthcheck:
        test: ["CMD-SHELL", "curl -f http://localhost:3000/health"]
        interval: 15s; timeout: 5s; retries: 5
  web-ui:
    image: your-registry/14kb-ui:latest
    ports: ["80:80"]
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 5s
  load-agent:
    image: your-registry/14kb-load:latest
    deploy:
      mode: global
      restart_policy: none
````

### 5.2 Swarm rules

* Use an **odd number of manager nodes** (3 or 5) to maintain quorum. Services continue even if quorum lost (but no updates) apply. ([Docker Documentation][1])
* Always add/move managers via `--availability drain` to avoid scheduling service tasks on managers. ([Docker Documentation][1])
* Use Docker configs/secrets for environment and TLS, avoid config drift across dev/staging/production.
* Monitor nodes with `docker node ls` or API. Use labels to constrain where `load-agent` or `test-agent` runs. ([Docker Documentation][2])

---

## 6. Stress‑testing rules

Define **stress testing as non-functional, worst-case load confirmation**:

* Target KPIs: response time (p90 < 200ms), throughput (≥ 500 requests/sec), error rate < 0.1%, memory/CPU usage under 70%.
* Run tests in staging mirrored to production env (same network, caching, DB).
* Start with low load and increment gradually until typical service breaks; document thresholds (duration, response times). ([DEV Community][3])
* Scenarios:

  * **High concurrency** – e.g. 100 RPS for 60s
  * **Sustained load** – e.g. 20 RPS × 10 minutes
  * **Spike** – ramp from 50 → 200 → cooldown
  * **Slow request (Slowloris)** – partial HTTP sends
  * **Error injection** – hitting programmed failure endpoints
  * **Network latency simulation** – in test configs add artificial delay

Each scenario must be reproducible via:

```bash
npm run stress-test
```

Listing baseline metrics on CI. Fail if latency doubles or error spike.

---

## FAQ & additional guidelines

| Question                                               | Answer                                                                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Are all tests mandatory?**                           | Yes — CI fails on missing or flaky tests.                                                                                                                |
| **What about performance budget?**                     | API + UI images together < 100 MB. Startup time < 2 s.                                                                                                   |
| **How to write tolerant tests for external services?** | Use dependency injection & mocks; test-service contract in integration and mock in unit suites.                                                          |
| **How to run stress tests during local development?**  | Run `npm run stress-test -- --quick` — fast, low‑traffic profiles. Don’t run long batch test flows in CI.                                                |
| **When do we refactor?**                               | Immediately after green test. Remove duplication, rename, simplify interfaces—always keep tests passing. ([DEV Community][3], [Docker Documentation][1]) |

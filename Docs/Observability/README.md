# Observability and Monitoring

Reference for the EduTrack observability stack: how telemetry flows, how each
component is configured, how to run and use it, and how to instrument the
backend and frontend.

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Ports and credentials](#ports-and-credentials)
- [Running the stack](#running-the-stack)
- [Configuration files](#configuration-files)
- [Telemetry flow in detail](#telemetry-flow-in-detail)
- [Using the tools](#using-the-tools)
- [Instrumenting the applications](#instrumenting-the-applications)
- [Common tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)
- [Data retention and volumes](#data-retention-and-volumes)
- [Makefile reference](#makefile-reference)

## Overview

EduTrack uses a self-hosted, container-based observability stack. It covers the
three pillars of telemetry:

| Pillar | Tool | Purpose |
| --- | --- | --- |
| Metrics | Prometheus | Scrape and store time-series metrics |
| Visualization | Grafana | Dashboards and metric exploration |
| Logs and traces | Seq | Structured logs and distributed traces |
| Collection | OpenTelemetry Collector | Receive OTLP telemetry and route it |

Everything runs on the shared `edutrack` Docker network, so services address
each other by container name (for example `http://prometheus:9090`).

The stack is split into one compose file per concern, all merged by the
`runner/Makefile`:

```
infrastructure/
├── docker-compose.network.yml     # shared network
├── docker-compose.volumes.yml     # persistent volumes
├── docker-compose.db.yml          # postgres
├── docker-compose.api.yml         # backend
├── docker-compose.web.yml         # frontend
├── docker-compose.prometheus.yml  # prometheus
├── docker-compose.seq.yml         # seq
├── docker-compose.grafana.yml     # grafana
├── docker-compose.otel.yml        # opentelemetry collector
├── observability/
│   ├── prometheus/prometheus.yml
│   ├── otel/otel-collector-config.yml
│   └── grafana/provisioning/datasources/prometheus.yml
└── runner/Makefile
```

## Architecture

```
                         OTLP (gRPC :4317 / HTTP :4318)
  ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐
  │  Frontend    │   │   Backend    │   │  Other services    │
  │ (browser/SSR)│   │  (.NET 9)    │   │  (future)          │
  └──────┬───────┘   └──────┬───────┘   └─────────┬──────────┘
         │                  │                     │
         └──────────────────┴──────────┬──────────┘
                                       ▼
                          ┌─────────────────────────┐
                          │  OpenTelemetry Collector │
                          │  receivers: otlp         │
                          └───────┬─────────┬───────┘
                     traces/logs  │         │  metrics (Prometheus exporter :8889)
                                  ▼         ▼
                          ┌───────────┐  ┌──────────────┐
                          │    Seq    │  │  Prometheus  │
                          │ :5341/:80 │  │    :9090     │
                          └─────┬─────┘  └──────┬───────┘
                                │               │
                                │               ▼
                                │        ┌──────────────┐
                                └───────▶│   Grafana    │
                                         │    :3000     │
                                         └──────────────┘
```

- Applications send OTLP telemetry to the collector.
- The collector forwards **traces** and **logs** to Seq.
- The collector exposes **metrics** in Prometheus format on `:8889`.
- Prometheus scrapes the collector (and itself).
- Grafana queries Prometheus and renders dashboards.

## Components

### Prometheus

- Image: `prom/prometheus:latest`
- Container: `edutrack-prometheus`
- Role: metrics database and scraper.
- Config: `observability/prometheus/prometheus.yml` (read-only mount at
  `/etc/prometheus/prometheus.yml`).
- Storage: `/prometheus`, backed by the `edutrack_prometheus_data` volume.
- Flags:
  - `--config.file=/etc/prometheus/prometheus.yml`
  - `--storage.tsdb.path=/prometheus`
  - `--web.enable-lifecycle` (allows config reload via the API)

Scrape jobs defined today:

| Job | Target | Description |
| --- | --- | --- |
| `prometheus` | `prometheus:9090` | Prometheus scrapes itself |
| `otel-collector` | `otel-collector:8889` | Metrics exported by the collector |

### Grafana

- Image: `grafana/grafana:latest`
- Container: `edutrack-grafana`
- Role: dashboards and metric exploration.
- Admin credentials come from `.env` (`GRAFANA_ADMIN_USER`,
  `GRAFANA_ADMIN_PASSWORD`).
- Storage: `/var/lib/grafana`, backed by `edutrack_grafana_data`.
- Provisioning: `observability/grafana/provisioning/` is mounted read-only at
  `/etc/grafana/provisioning`. A Prometheus datasource
  (`http://prometheus:9090`) is created automatically and marked as default.
- Sign-up is disabled with `GF_USERS_ALLOW_SIGN_UP=false`.

### Seq

- Image: `datalust/seq:latest`
- Container: `edutrack-seq`
- Role: structured log and trace storage, search, and analysis.
- Requires `ACCEPT_EULA=Y`.
- Storage: `/data`, backed by `edutrack_seq_data`.
- UI is served on container port `80` (host `SEQ_UI_PORT`, default `8081`).
- OTLP ingestion is available on container port `5341`
  (`http://seq:5341/ingest/otlp`).

### OpenTelemetry Collector

- Image: `otel/opentelemetry-collector-contrib:latest`
- Container: `edutrack-otel-collector`
- Role: vendor-neutral telemetry gateway.
- Config: `observability/otel/otel-collector-config.yml`, mounted at
  `/etc/otelcol-contrib/config.yml`.
- Receivers: OTLP gRPC (`:4317`) and OTLP HTTP (`:4318`).
- Exporters:
  - `otlphttp/seq` → `http://seq:5341/ingest/otlp` (traces and logs)
  - `prometheus` → `0.0.0.0:8889` (metrics for Prometheus to scrape)
  - `debug` → collector logs (useful while validating pipelines)
- Processors: `batch` (buffers and compresses telemetry before export).

## Ports and credentials

All values are configurable in `infrastructure/.env`.

| Variable | Default | Service | Description |
| --- | --- | --- | --- |
| `PROMETHEUS_PORT` | `9090` | Prometheus | Prometheus UI/API |
| `GRAFANA_PORT` | `3001` | Grafana | Grafana UI (container `3000`) |
| `GRAFANA_ADMIN_USER` | `dev_admin` | Grafana | Admin username |
| `GRAFANA_ADMIN_PASSWORD` | `dev_password` | Grafana | Admin password |
| `SEQ_PORT` | `5341` | Seq | OTLP/log ingestion |
| `SEQ_UI_PORT` | `8081` | Seq | Seq web UI (container `80`) |
| `OTEL_GRPC_PORT` | `4317` | Collector | OTLP gRPC receiver |
| `OTEL_HTTP_PORT` | `4318` | Collector | OTLP HTTP receiver |
| `OTEL_METRICS_PORT` | `8889` | Collector | Prometheus metrics exporter |

Local URLs:

- Prometheus: <http://localhost:9090>
- Prometheus targets: <http://localhost:9090/targets>
- Grafana: <http://localhost:3001>
- Seq: <http://localhost:8081>
- Collector metrics (raw): <http://localhost:8889/metrics>

> Credentials in `.env` are development defaults. Never use them in a shared or
> production environment.

## Running the stack

Prerequisites: Docker Engine with Compose v2+ and GNU Make.

From the repository root:

```sh
make -C infrastructure/runner up       # build and start everything
make -C infrastructure/runner ps       # list running services
make -C infrastructure/runner logs     # follow logs from all services
make -C infrastructure/runner down     # stop and remove containers
make -C infrastructure/runner clean    # stop and remove volumes too
```

From `infrastructure/runner`:

```sh
make up
make down
```

Starting only the observability stack (no app rebuild) is possible with the
same compose files:

```sh
docker compose \
  --env-file .env \
  -f docker-compose.network.yml \
  -f docker-compose.volumes.yml \
  -f docker-compose.prometheus.yml \
  -f docker-compose.seq.yml \
  -f docker-compose.grafana.yml \
  -f docker-compose.otel.yml \
  up -d
```

## Configuration files

### `observability/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ["prometheus:9090"]

  - job_name: otel-collector
    static_configs:
      - targets: ["otel-collector:8889"]
```

- `scrape_interval` controls how often targets are polled. Lower values give
  finer resolution at the cost of storage and CPU.
- Targets use container DNS names because all services share the `edutrack`
  network.

### `observability/otel/otel-collector-config.yml`

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch: {}

exporters:
  debug:
    verbosity: basic
  prometheus:
    endpoint: 0.0.0.0:8889
  otlphttp/seq:
    endpoint: http://seq:5341/ingest/otlp

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/seq]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/seq]
```

- Each pipeline wires receivers → processors → exporters.
- `batch` reduces network calls and CPU overhead; remove it only for debugging
  when you need immediate delivery.
- The `debug` exporter is declared but not attached to a pipeline. Attach it
  temporarily (for example `exporters: [debug, otlphttp/seq]`) to print
  telemetry to `docker logs edutrack-otel-collector`.

### `observability/grafana/provisioning/datasources/prometheus.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

Grafana reads provisioning files on startup. Restart the container after
changing them:

```sh
docker restart edutrack-grafana
```

## Telemetry flow in detail

1. **Emission.** An application creates spans (traces), metric instruments, and
   log records using an OpenTelemetry SDK.
2. **Transport.** The SDK exports over OTLP to `otel-collector:4317` (gRPC) or
   `otel-collector:4318` (HTTP).
3. **Collection.** The collector receives the data and applies processors.
4. **Routing.**
   - Traces and logs go to Seq through the `otlphttp/seq` exporter. Seq appends
     `/v1/traces` and `/v1/logs` to the configured endpoint.
   - Metrics are converted by the `prometheus` exporter and exposed for scraping
     on `:8889`.
5. **Storage.** Seq persists logs/traces; Prometheus persists metrics on disk.
6. **Query.** Users search Seq directly and query Prometheus through Grafana.

Because the collector sits in the middle, applications never need to know where
Seq or Prometheus live. Adding a new backend (for example Tempo or Jaeger) only
requires editing the collector config.

## Using the tools

### Prometheus

Open <http://localhost:9090>.

Useful queries while validating the pipeline:

```promql
# Is the collector being scraped successfully?
up{job="otel-collector"}

# Spans accepted by the collector, per second
rate(otelcol_receiver_accepted_spans_total[5m])

# Spans exported to Seq, per second
rate(otelcol_exporter_sent_spans_total[5m])

# Collector process uptime
otelcol_process_uptime_seconds_total

# Metrics dropped by the collector
rate(otelcol_processor_dropped_metric_points_total[5m])
```

Check <http://localhost:9090/targets> to confirm both jobs are `UP`.

### Seq

Open <http://localhost:8081>. Typical searches:

```
# Errors only
@Level = 'Error'

# Everything from the backend service
ServiceName = 'edutrack-api'

# Slow requests (if duration is captured as a property)
Duration > 1000

# Trace by id
TraceId = '4bf92f3577b34da6a3ce929d0e0e4736'

# Free text
"timeout"
```

Seq understands structured properties, so prefer filtering on named properties
(`ServiceName`, `@Level`, `TraceId`) over free-text search.

### Grafana

Open <http://localhost:3001> and log in with the credentials from `.env`.

1. The Prometheus datasource is already configured.
2. Create a dashboard: **Dashboards → New → New dashboard**.
3. Add a panel, choose the Prometheus datasource, and enter a PromQL query such
   as `rate(otelcol_receiver_accepted_spans_total[5m])`.
4. Save the dashboard.

For repeatable dashboards, add JSON models under
`observability/grafana/provisioning/dashboards/` and a dashboard provider file
(see [Common tasks](#common-tasks)).

## Instrumenting the applications

The observability stack is ready, but the applications must emit telemetry
before anything appears in Seq or Prometheus.

### Backend (.NET 9)

Add the OpenTelemetry packages:

```xml
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.9.0" />
<PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.9.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.9.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.9.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.Runtime" Version="1.9.0" />
```

Register it in `Program.cs`:

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(
        serviceName: builder.Configuration["OTEL_SERVICE_NAME"] ?? "edutrack-api"))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter())
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddOtlpExporter());

builder.Logging.AddOpenTelemetry(o =>
{
    o.IncludeScopes = true;
    o.IncludeFormattedMessage = true;
    o.AddOtlpExporter();
});
```

Point the backend at the collector by adding these environment variables to
`docker-compose.api.yml`:

```yaml
environment:
  OTEL_SERVICE_NAME: edutrack-api
  OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317
  OTEL_EXPORTER_OTLP_PROTOCOL: grpc
  OTEL_RESOURCE_ATTRIBUTES: deployment.environment=${ASPNETCORE_ENVIRONMENT:-Development}
```

Notes:

- The endpoint uses the container name and the gRPC port (`4317`). For OTLP
  over HTTP use `http://otel-collector:4318` with
  `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`.
- Metrics sent over OTLP reach Prometheus through the collector's `:8889`
  exporter. No extra Prometheus scrape job is required.
- If you prefer Prometheus to scrape the backend directly, expose `/metrics`
  (for example with `prometheus-net`) and add a job to `prometheus.yml`.

### Frontend (browser)

Browser telemetry must reach a host-accessible endpoint, so use
`http://localhost:4318`. Install the web SDK:

```sh
bun add @opentelemetry/sdk-trace-web \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/instrumentation-fetch \
  @opentelemetry/context-zone
```

Initialize it once before the app renders:

```ts
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { resourceFromAttributes } from "@opentelemetry/resources";

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({ "service.name": "edutrack-frontend" }),
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" }),
    ),
  ],
});

provider.register({ contextManager: new ZoneContextManager() });

registerInstrumentations({
  instrumentations: [new FetchInstrumentation()],
});
```

Browsers enforce CORS, so the collector's HTTP receiver must allow the
frontend origin. Update `otel-collector-config.yml`:

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins:
            - "http://localhost:3000"
            - "http://localhost:3001"
          allowed_headers: ["*"]
```

Then restart the collector:

```sh
docker restart edutrack-otel-collector
```

### Correlation

To connect logs, traces, and metrics:

- Propagate `traceparent`/`tracestate` headers between the frontend and
  backend (the fetch instrumentation and ASP.NET instrumentation do this
  automatically when both are enabled).
- Include `TraceId` and `SpanId` in log scopes so Seq can pivot from a log line
  to its trace.
- Use consistent `service.name` values (`edutrack-api`, `edutrack-frontend`).

## Common tasks

### Add a Prometheus scrape target

1. Edit `observability/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: backend
    metrics_path: /metrics
    static_configs:
      - targets: ["backend:8080"]
```

2. Reload Prometheus without downtime (lifecycle API is enabled):

```sh
curl -X POST http://localhost:9090/-/reload
```

3. Confirm the target is `UP` at <http://localhost:9090/targets>.

### Add a Grafana dashboard via provisioning

1. Create `observability/grafana/provisioning/dashboards/dashboards.yml`:

```yaml
apiVersion: 1

providers:
  - name: EduTrack
    orgId: 1
    folder: EduTrack
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/provisioning/dashboards
```

2. Drop exported dashboard JSON files into
   `observability/grafana/provisioning/dashboards/`.
3. Restart Grafana: `docker restart edutrack-grafana`.

### Add a Seq API key

If you enable Seq authentication, create an API key in **Settings → API Keys**
and pass it to the collector exporter:

```yaml
exporters:
  otlphttp/seq:
    endpoint: http://seq:5341/ingest/otlp
    headers:
      X-Seq-ApiKey: ${env:SEQ_API_KEY}
```

Then add `SEQ_API_KEY` to `.env` and expose it to the collector in
`docker-compose.otel.yml`:

```yaml
environment:
  SEQ_API_KEY: ${SEQ_API_KEY}
```

### Change retention

Prometheus (default is 15 days). Add a flag to
`docker-compose.prometheus.yml`:

```yaml
command:
  - --config.file=/etc/prometheus/prometheus.yml
  - --storage.tsdb.path=/prometheus
  - --storage.tsdb.retention.time=30d
  - --web.enable-lifecycle
```

Seq retention is configured in the Seq UI under **Settings → Retention**.

### Sample a busy pipeline

Reduce volume and cost by sampling traces in the collector:

```yaml
processors:
  probabilistic_sampler:
    sampling_percentage: 10

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [probabilistic_sampler, batch]
      exporters: [otlphttp/seq]
```

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| Nothing in Seq | `docker logs edutrack-otel-collector`; confirm apps export to `otel-collector:4317`; check Seq is healthy; verify the `otlphttp/seq` endpoint |
| Prometheus target `DOWN` | Open <http://localhost:9090/targets>; confirm the target name resolves on the `edutrack` network; check the exporter port |
| Grafana shows no data | Confirm the Prometheus datasource URL is `http://prometheus:9090`; run the query directly in Prometheus first |
| Collector exits on start | `docker logs edutrack-otel-collector`; validate YAML indentation in `otel-collector-config.yml` |
| Port already in use | Change the matching variable in `.env` (for example `GRAFANA_PORT=3002`) and rerun `make up` |
| Seq shows the EULA screen | `ACCEPT_EULA=Y` must be set; it already is in `docker-compose.seq.yml` |
| Browser spans rejected | Add CORS to the OTLP HTTP receiver and restart the collector |
| Metrics missing but traces present | Ensure the metrics pipeline uses the `prometheus` exporter and that Prometheus scrapes `otel-collector:8889` |

Useful commands:

```sh
docker compose -f docker-compose.otel.yml logs -f
docker inspect edutrack-otel-collector
docker network inspect edutrack
curl http://localhost:8889/metrics
curl http://localhost:9090/-/healthy
```

## Security notes

- Change the Grafana admin password and the database credentials before any
  shared deployment.
- Enable Seq authentication and use an API key for ingestion.
- Do not publish observability ports to the public internet. Keep them bound to
  localhost or behind the reverse proxy.
- Treat `.env` as sensitive. It contains credentials; do not commit real
  secrets.
- Prefer Docker secrets or an external secret manager in production.
- Telemetry can contain personal data. Review what the applications emit and
  apply retention limits.

## Data retention and volumes

| Volume | Service | Contents |
| --- | --- | --- |
| `edutrack_postgres_data` | Postgres | Database files |
| `edutrack_prometheus_data` | Prometheus | Time-series blocks and WAL |
| `edutrack_grafana_data` | Grafana | Dashboards, users, settings |
| `edutrack_seq_data` | Seq | Logs, traces, configuration |

Volumes persist across `make down`. They are only deleted by `make clean`
(`docker compose down -v`). Back up any dashboard or Seq configuration you want
to keep before running `clean`.

## Makefile reference

`infrastructure/runner/Makefile` merges every compose file and uses
`infrastructure/.env`.

| Target | Command | Effect |
| --- | --- | --- |
| `up` | `docker compose ... up -d --build` | Build images and start all services |
| `down` | `docker compose ... down` | Stop and remove containers and the network (volumes kept) |
| `restart` | `down` then `up` | Recreate the whole stack |
| `logs` | `docker compose ... logs -f` | Follow logs |
| `ps` | `docker compose ... ps` | Show service status |
| `build` | `docker compose ... build` | Build images without starting |
| `clean` | `docker compose ... down -v --remove-orphans` | Remove containers and volumes |

---

[Back to Docs](../README.md) · [Back to main README](../../README.md)

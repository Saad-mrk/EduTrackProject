# EduTrackProject

EduTrack is a full-stack project composed of a backend service, a frontend
application, reverse-proxy/deployment configuration, and supporting
documentation.

## Repository Structure

```
DEVops/
├── Backend/          Backend application and API
├── FrontEnd/         Frontend application
├── Nginix/           Nginx / reverse-proxy configuration
├── Docs/             Changelogs, database, and workflows
└── Documentation/    Guides and reference documentation
```

## Directory Guides

| Directory | Description |
| --- | --- |
| [Backend](./Backend/README.md) | Server-side application code and API. |
| [FrontEnd](./FrontEnd/README.md) | Client-side application and UI. |
| [Nginix](./Nginix/README.md) | Reverse proxy and deployment configuration. |
| [Docs](./Docs/README.md) | Changelogs, database reference, and workflows. |
| [Documentation](./Documentation/README.md) | Setup guides, architecture, and API reference. |

### Docs sections

- [Change logs](./Docs/Change%20logs/README.md)
- [Database](./Docs/Database/README.md)
- [WorkFlows](./Docs/WorkFlows/README.md)
- [Observability](./Docs/Observability/README.md)

## Prerequisites

The local stack is orchestrated with Docker Compose and driven by a Makefile.
Both are required:

- Docker Engine with the Compose plugin (v2+)
- GNU Make

Verify they are installed:

```sh
docker compose version
make --version
```

Start the full stack with `make -C infrastructure/runner up`, and stop it with
`make -C infrastructure/runner down`.

## Getting Started

Each directory has its own README with purpose, structure, and setup notes.
Start with the directory most relevant to your task, then follow its
instructions.

## Contributing

Keep each directory's README up to date when adding or restructuring code, and
link any new top-level directory from this file.

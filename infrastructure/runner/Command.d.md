# Runner Make Commands

Run from `infrastructure/runner`. Local targets use `docker-compose.nginx.local.yml`; prod targets use `docker-compose.nginx.prod.yml`.

| Command | Description | Underlying action |
| --- | --- | --- |
| `make up-local` | Build and start the full stack locally (detached) | `docker compose ... up -d --build` |
| `make down-local` | Stop and remove local containers | `docker compose ... down` |
| `make restart-local` | Restart local stack | `down-local` then `up-local` |
| `make logs-local` | Follow local container logs | `docker compose ... logs -f` |
| `make ps-local` | List local container status | `docker compose ... ps` |
| `make build-local` | Build local images without starting | `docker compose ... build` |
| `make clean-local` | Tear down local stack, volumes, and orphans | `docker compose ... down -v --remove-orphans` |
| `make up-prod` | Build and start the full stack in production mode (detached) | `docker compose ... up -d --build` |
| `make down-prod` | Stop and remove production containers | `docker compose ... down` |
| `make restart-prod` | Restart production stack | `down-prod` then `up-prod` |
| `make logs-prod` | Follow production container logs | `docker compose ... logs -f` |
| `make ps-prod` | List production container status | `docker compose ... ps` |
| `make build-prod` | Build production images without starting | `docker compose ... build` |
| `make clean-prod` | Tear down production stack, volumes, and orphans | `docker compose ... down -v --remove-orphans` |

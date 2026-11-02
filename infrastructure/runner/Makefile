COMPOSE_FILES = -f ../docker-compose.network.yml -f ../docker-compose.volumes.yml -f ../docker-compose.db.yml -f ../docker-compose.api.yml -f ../docker-compose.web.yml -f ../docker-compose.prometheus.yml -f ../docker-compose.seq.yml -f ../docker-compose.grafana.yml -f ../docker-compose.otel.yml
COMPOSE = docker compose --env-file ../.env $(COMPOSE_FILES)

.PHONY: up down restart logs ps build clean

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

build:
	$(COMPOSE) build

clean:
	$(COMPOSE) down -v --remove-orphans

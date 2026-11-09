BASE_COMPOSE_FILES = -f ../docker-compose.network.yml -f ../docker-compose.volumes.yml -f ../docker-compose.db.yml -f ../docker-compose.api.yml -f ../docker-compose.web.yml -f ../docker-compose.prometheus.yml -f ../docker-compose.seq.yml -f ../docker-compose.grafana.yml -f ../docker-compose.otel.yml

LOCAL_COMPOSE_FILES = $(BASE_COMPOSE_FILES) -f ../docker-compose.nginx.local.yml
PROD_COMPOSE_FILES = $(BASE_COMPOSE_FILES) -f ../docker-compose.nginx.prod.yml

LOCAL_COMPOSE = docker compose --env-file ../.env $(LOCAL_COMPOSE_FILES)
PROD_COMPOSE = docker compose --env-file ../.env $(PROD_COMPOSE_FILES)

.PHONY: up-local down-local restart-local logs-local ps-local build-local clean-local \
        up-prod down-prod restart-prod logs-prod ps-prod build-prod clean-prod

# --- Local ---
up-local:
	$(LOCAL_COMPOSE) up -d --build

down-local:
	$(LOCAL_COMPOSE) down

restart-local: down-local up-local

logs-local:
	$(LOCAL_COMPOSE) logs -f

ps-local:
	$(LOCAL_COMPOSE) ps

build-local:
	$(LOCAL_COMPOSE) build

clean-local:
	$(LOCAL_COMPOSE) down -v --remove-orphans

# --- Production ---
up-prod:
	$(PROD_COMPOSE) up -d --build

down-prod:
	$(PROD_COMPOSE) down

restart-prod: down-prod up-prod

logs-prod:
	$(PROD_COMPOSE) logs -f

ps-prod:
	$(PROD_COMPOSE) ps

build-prod:
	$(PROD_COMPOSE) build

clean-prod:
	$(PROD_COMPOSE) down -v --remove-orphans

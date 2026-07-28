include .env

# Dev: docker-compose.yaml + docker-compose.override.yaml (auto-loaded)
DC_DEV := docker compose
# Prod: base + production override, explicit chain
DC_PROD := docker compose -f docker-compose.yaml -f docker-compose.production.yaml

dev_env_up:
	$(DC_DEV) up -d
dev_env_restart:
	$(DC_DEV) up -d --build
dev_env_down:
	$(DC_DEV) down
dev_env_rm:
	$(DC_DEV) down --rmi local -v
dev_env_start:
	$(DC_DEV) start
dev_env_stop:
	$(DC_DEV) stop
dev_env_config:
	$(DC_DEV) config

dev_app_connect:
	$(DC_DEV) exec -it node bash
dev_app_start:
	$(DC_DEV) exec -it node yarn dev

prod_env_up:
	$(DC_PROD) up -d
prod_env_restart:
	$(DC_PROD) up -d --build
prod_env_down:
	$(DC_PROD) down
prod_env_rm:
	$(DC_PROD) down --rmi local -v
prod_env_start:
	$(DC_PROD) start
prod_env_stop:
	$(DC_PROD) stop
prod_env_config:
	$(DC_PROD) config

include .env

dev_env_up:
	docker compose -f ./docker-compose.development.yaml up -d
dev_env_restart:
	docker compose -f ./docker-compose.development.yaml up -d --build
dev_env_down:
	docker compose -f ./docker-compose.development.yaml down
dev_env_rm:
	docker compose -f ./docker-compose.development.yaml down --rmi local -v
dev_env_start:
	docker compose -f ./docker-compose.development.yaml start
dev_env_stop:
	docker compose -f ./docker-compose.development.yaml stop

dev_app_connect:
	docker compose -f ./docker-compose.development.yaml exec -it node bash
dev_app_start:
	docker compose -f ./docker-compose.development.yaml exec -it node yarn dev

prod_env_up:
	docker compose -f ./docker-compose.production.yaml up -d
prod_env_restart:
	docker compose -f ./docker-compose.production.yaml up -d --build
prod_env_down:
	docker compose -f ./docker-compose.production.yaml down
prod_env_rm:
	docker compose -f ./docker-compose.production.yaml down --rmi local -v
prod_env_start:
	docker compose -f ./docker-compose.production.yaml start
prod_env_stop:
	docker compose -f ./docker-compose.production.yaml stop

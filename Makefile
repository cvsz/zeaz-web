SHELL := /bin/sh

.PHONY: help setup check test dev build docker-build docker-up docker-down deploy-dry deploy ci

help:
	@printf '%s\n' 'Targets: setup check test dev build docker-build docker-up docker-down deploy-dry deploy ci'

setup:
	npm install

check:
	npm run check

test:
	npm test

dev:
	npm run dev

build: deploy-dry

docker-build:
	docker build -t zeaz-web:local .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

deploy-dry:
	npm run deploy:dry

deploy:
	npm run deploy

ci: test deploy-dry

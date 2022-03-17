#!/bin/bash
DOCKER_BUILDKIT=1 docker-compose up -d plantuml
# DOCKER_BUILDKIT=1 docker-compose up --build serve
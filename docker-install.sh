#!/bin/sh
docker-compose pull
docker-compose up -d --force-recreate
docker image prune -f
#!/usr/bin/bash
REPOSITORY = "ghcr.io/totodore/automate"
docker-compose rm automate -s -f
docker rmi --force $(docker images -q $REPOSITORY | uniq)
docker-compose up -d --force-recreate

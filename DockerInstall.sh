#!/bin/bash
repository="ghcr.io/totodore/automate";
#On Arrete le container
docker-compose stop app
#On remove l'image actuelle
docker rmi --force $(docker images -q $repository | uniq)
#On recréé le conteneur avec --force-recreate pour forcer un retéléchargement de l'image
docker-compose up -d --force-recreate   
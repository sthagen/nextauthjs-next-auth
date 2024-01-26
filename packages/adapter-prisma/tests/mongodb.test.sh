#!/usr/bin/env bash

CONTAINER_NAME=authjs-mongodb-test


# Start db
docker run -d --rm -p 27017:27017 --name ${CONTAINER_NAME} "prismagraphql/mongo-single-replica:4.4.3-bionic"

pnpm prisma generate --schema ./prisma/mongodb.prisma

# Always stop container, but exit with 1 when tests are failing
if CONTAINER_NAME=${CONTAINER_NAME} vitest --config=../utils/vitest.config.ts --coverage;then
    docker stop ${CONTAINER_NAME}
else
    docker stop ${CONTAINER_NAME} && exit 1
fi
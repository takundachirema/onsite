# Onsite

## Running The Project

Install pnpm first: https://pnpm.io/installation

Clone this repository then run pnpm install

```bash
pnpm install
```

## Environment Variables

Setup the environmental variables by copying the .env.copy into a .env file

```bash
cp .env.copy .env
```

## Postgresql docker setup

Install docker desktop first for your machine:
https://docs.docker.com/engine/install/

Run the Postgresql server through docker-compose.

```bash
sudo docker-compose up -d
```

To stop the container run

```bash
sudo docker-compose stop
```

Run migrate to update your DB schema

```bash
npx prisma migrate dev
```

### Run SQL Commands on cli

Run this command to view the container ids:

```
docker ps
```

Run this command to get into the postgres docker container:

```
docker exec -it postgres_container_id bash
psql onsite onsite_admin
```

Then run this command to show the tables:
`\dt`

Then run this command to show table columns:
`select * from dashboard_analytics_transaction where false;`

If you face an error 'role does not exists' make sure you delete the onsite_pgdata volume and re-run `docker compose up -d`

### Run SQL Commands on GUI

You can install PGAdmin GUI to view DBs and Tables:
https://www.pgadmin.org/download/

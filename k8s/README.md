# OSS Kubernetes manifests

These manifests mirror the services and runtime configuration in the root
`docker-compose.yml` file.

## Configure secrets

Replace every `replace-me` value in the local `secret.yaml` file. The file is
ignored by Git.

The OpenRouter values should match the root `.env` file. `DB_PASSWORD` must be
the same password used by PostgreSQL and the backend.

## Apply

Apply the files in this order:

1. `ns.yaml`
2. `secret.yaml`
3. `configmap.yaml`
4. `db.yaml`
5. `back.yaml`
6. `front.yaml`

The SQL under `db-init-sql` runs only when PostgreSQL initializes an empty
volume. If an older `db-pvc` already exists, updating `db.yaml` will not update
that existing database schema; recreate the database PVC or use a migration.

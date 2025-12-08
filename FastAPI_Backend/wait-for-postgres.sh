#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=plateplan psql -h "$host" -U "plateplan" -d "plateplan" -c "SELECT 1" > /dev/null 2>&1; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - executing command"
exec $cmd


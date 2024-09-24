#!/bin/bash

# Check if a mnemonic was provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <mnemonic>"
    exit 1
fi

MNEMONIC=$1

# Function to create or update .env file
update_env_file() {
    local env_file=$1
    if [ -f "$env_file" ]; then
        # If .env exists, update the MNEMONIC line
        sed -i.bak '/^MNEMONIC=/d' "$env_file" && rm -f "${env_file}.bak"
        echo "MNEMONIC=$MNEMONIC" >> "$env_file"
        echo "Updated $env_file"
    else
        # If .env doesn't exist, create it with the MNEMONIC
        echo "MNEMONIC=$MNEMONIC" > "$env_file"
        echo "Created $env_file"
    fi
}

# Update .env in the root directory
update_env_file ".env"

# Update .env in v1-endpoint-deployment
update_env_file "v1-endpoint-deployment/.env"

# Update .env in v2-endpoint-deployment
update_env_file "v2-endpoint-deployment/.env"

echo "Environment setup complete."
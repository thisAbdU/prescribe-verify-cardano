FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Aiken using the official installer
RUN curl -L https://github.com/aiken-lang/aiken/releases/latest/download/aiken-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /usr/local/bin && \
    chmod +x /usr/local/bin/aiken

WORKDIR /app

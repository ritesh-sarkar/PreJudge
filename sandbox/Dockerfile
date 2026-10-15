FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install native compilers and runtimes: C++20 (g++), C17 (gcc), Python 3, Java 17
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    gcc \
    make \
    python3 \
    openjdk-17-jdk-headless \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash sandboxuser
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev || true
COPY . .

RUN mkdir -p /tmp/prejudge_sandbox && chown -R sandboxuser:sandboxuser /tmp/prejudge_sandbox /app

USER sandboxuser

ENV PORT=8080
ENV NODE_ENV=production
ENV SANDBOX_TMP_DIR=/tmp/prejudge_sandbox

EXPOSE 8080

CMD ["node", "server.js"]
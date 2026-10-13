FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install g++ with C++20 support
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged sandbox user
RUN useradd -m -s /bin/bash sandboxuser

# Work directory
WORKDIR /sandbox

# Restrict permissions
RUN chown -R sandboxuser:sandboxuser /sandbox

USER sandboxuser

CMD ["/bin/bash"]

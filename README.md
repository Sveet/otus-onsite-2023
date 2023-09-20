# Otus Capture The Flag 2023

## Overview

This project was designed to run on a Raspberry Pi 3B.

The server is written using the BETH stack: Bun, ElysiaJS, Turso (SQLite), and HTMX.

## Running Locally

### Pre-requisites

Bun should be installed. On MacOS, this can be done via `brew install bun`. See https://bun.sh/ for more information.

### Installing Dependencies
Use `bun` to install dependencies
```bash
bun install
```

### Running the Server
Use `bun` to run the project
```bash
bun run   // run in production mode
bun dev   // run in development mode (hot reload)
```
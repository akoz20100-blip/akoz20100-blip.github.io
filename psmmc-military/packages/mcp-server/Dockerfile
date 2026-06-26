# PSMMC MCP server — long-running Streamable HTTP host.
# Build:  docker build -t psmmc-mcp .
# Run:    docker run -p 8787:8787 -e PSMMC_MCP_TOKEN=your-secret psmmc-mcp
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# No data files are bundled: the server reproduces the deterministic demo dataset
# in-memory at startup. Mount a volume and set PSMMC_DATA_DIR to serve real data.
ENV PORT=8787
ENV HOST=0.0.0.0
EXPOSE 8787
CMD ["node", "dist/index.js", "--http"]

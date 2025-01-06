#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_KEY = process.env.MARGINALIA_API_KEY || 'public';
const BASE_URL = 'https://api.marginalia.nu';

interface SearchResult {
  url: string;
  title: string;
  description: string;
}

interface MarginaliaResponse {
  query: string;
  license: string;
  results: SearchResult[];
}

const server = new Server(
  {
    name: "marginalia-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search-marginalia",
        description: "Search the web using Marginalia Search",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query"
            },
            index: {
              type: "number",
              description: "Search index (corresponds to dropdown in main GUI)",
              minimum: 0
            },
            count: {
              type: "number",
              description: "Number of results to return",
              minimum: 1,
              maximum: 100
            }
          },
          required: ["query"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: { params: { name: string; arguments?: any } }) => {
  if (request.params.name !== "search-marginalia") {
    throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
  }

  const { query, index = 0, count = 10 } = request.params.arguments as {
    query: string;
    index?: number;
    count?: number;
  };

  try {
    const url = `${BASE_URL}/${API_KEY}/search/${encodeURIComponent(query)}`;
    const params = { index, count };
    
    const response = await axios.get<MarginaliaResponse>(url, { params });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          query: response.data.query,
          license: response.data.license,
          results: response.data.results.map(result => ({
            url: result.url,
            title: result.title,
            description: result.description
          }))
        }, null, 2)
      }]
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 503) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Rate limit exceeded. Consider requesting a dedicated API key from kontakt@marginalia.nu"
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Search failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Marginalia MCP server running on stdio');
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

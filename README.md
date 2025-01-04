# Marginalia MCP Server

An MCP (Model Context Protocol) server that provides access to [Marginalia Search](https://search.marginalia.nu/), a search engine focused on finding non-commercial content and hidden gems of the internet.

## Features

- Search the web using Marginalia Search API
- Configurable search parameters including index and result count
- Rate limiting protection with helpful error messages
- Built using the MCP SDK for seamless integration

## Installation

```bash
npm install
npm run build
```

## Configuration

The server can be configured using environment variables:

- `MARGINALIA_API_KEY`: Your Marginalia Search API key (optional, defaults to public access)

To request a dedicated API key, contact: kontakt@marginalia.nu

## Usage

The server provides the following MCP tool:

### search

Search the web using Marginalia Search with the following parameters:

- `query` (required): Search query string
- `index` (optional): Search index number (corresponds to dropdown in main GUI)
- `count` (optional): Number of results to return (1-100, default: 10)

Example usage through MCP:

```typescript
const result = await mcp.useTool("marginalia", "search", {
  query: "interesting non-commercial websites",
  count: 5
});
```

## Response Format

The search results are returned in the following format:

```json
{
  "query": "your search query",
  "license": "license information",
  "results": [
    {
      "url": "result url",
      "title": "page title",
      "description": "page description"
    }
    // ... more results
  ]
}
```

## Error Handling

The server includes robust error handling for:
- Rate limiting (503 responses)
- Invalid requests
- Network errors
- API-specific errors

## Adding Text-to-Speech Support

To enable text-to-speech capabilities using the say MCP server, add the following configuration:

### For Cline (VSCode Extension)

Add to `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "say": {
      "command": "node",
      "args": ["/Users/barton/worlds/servers/src/say-mcp-server/build/index.js"]
    }
  }
}
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "say": {
      "command": "node",
      "args": ["/Users/barton/worlds/servers/src/say-mcp-server/build/index.js"]
    }
  }
}
```

The say MCP server provides text-to-speech capabilities with multiple voices and languages. Available tools:

- `speak`: Read text aloud using specified voice and rate
- `list_voices`: List all available text-to-speech voices

## License

MIT License - See LICENSE file for details

from mcp.server.fastmcp import FastMCP
import httpx

# Create an MCP Server for live weather
mcp = FastMCP("TravelWeatherMCP")

@mcp.tool()
async def get_live_weather(location: str) -> str:
    """
    Get the live current weather for a specific travel destination.
    This tool allows AI agents to read real-time weather data.
    """
    try:
        # Using a free weather API that doesn't require an API key
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://wttr.in/{location}?format=%C+%t", timeout=5.0)
            if response.status_code == 200:
                return f"The current weather in {location} is {response.text.strip()}."
            return f"Could not fetch weather for {location}. Status: {response.status_code}"
    except Exception as e:
        return f"Error fetching weather from external service: {e}"

if __name__ == "__main__":
    # Run the MCP server over standard input/output
    print("Starting Travel Weather MCP Server...")
    mcp.run()

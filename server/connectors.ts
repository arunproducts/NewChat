function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface ConnectorInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  isConnected: boolean;
}

// In-memory connector store (mock implementation)
const connectors = new Map<string, ConnectorInfo>();

// Create a sample Chrome connector (Tabseer)
const CHROME_CONNECTOR_ID = "chrome-tabseer";
connectors.set(CHROME_CONNECTOR_ID, {
  id: CHROME_CONNECTOR_ID,
  name: "Tabseer - Chrome Connector",
  description: "Connects xelo with your Chrome browser to read open tabs and interact with them.",
  provider: "chrome",
  isConnected: false,
});

export function listConnectors() {
  return Array.from(connectors.values());
}

export function getConnectorById(id: string) {
  return connectors.get(id) || null;
}

export function connectConnector(id: string) {
  const connector = connectors.get(id);
  if (!connector) return null;
  connector.isConnected = true;
  connectors.set(id, connector);
  return connector;
}

export function disconnectConnector(id: string) {
  const connector = connectors.get(id);
  if (!connector) return null;
  connector.isConnected = false;
  connectors.set(id, connector);
  return connector;
}

export function getConnectorTabs(id: string) {
  // Mock data: in a real implementation this would query a Chrome extension or local agent
  const connector = connectors.get(id);
  if (!connector) return null;

  if (!connector.isConnected) return { error: "not_connected" } as any;

  const tabs = [
    {
      id: makeId("tab"),
      title: "OpenAI - ChatGPT",
      url: "https://chat.openai.com/",
      favIconUrl: "https://chat.openai.com/favicon.ico",
      lastActive: Date.now() - 10000,
    },
    {
      id: makeId("tab"),
      title: "GitHub - NewChat",
      url: "https://github.com/arunproducts/NewChat",
      favIconUrl: "https://github.githubassets.com/favicon.ico",
      lastActive: Date.now() - 60000,
    },
    {
      id: makeId("tab"),
      title: "StackOverflow - How to use Web Speech API",
      url: "https://stackoverflow.com/",
      favIconUrl: "https://stackoverflow.com/favicon.ico",
      lastActive: Date.now() - 120000,
    },
  ];

  return tabs;
}

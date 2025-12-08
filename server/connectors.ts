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

// Mock in-memory store for tab state (simulating Chrome tabs)
const tabStore = new Map<string, Array<{
  id: string;
  title: string;
  url: string;
  favIconUrl: string;
  lastActive: number;
  isActive: boolean;
}>>();

// Initialize sample tabs for chrome-tabseer
function initializeSampleTabs() {
  const sampleTabs = [
    {
      id: makeId("tab"),
      title: "OpenAI - ChatGPT",
      url: "https://chat.openai.com/",
      favIconUrl: "https://chat.openai.com/favicon.ico",
      lastActive: Date.now() - 10000,
      isActive: true,
    },
    {
      id: makeId("tab"),
      title: "GitHub - NewChat",
      url: "https://github.com/arunproducts/NewChat",
      favIconUrl: "https://github.githubassets.com/favicon.ico",
      lastActive: Date.now() - 60000,
      isActive: false,
    },
    {
      id: makeId("tab"),
      title: "StackOverflow - How to use Web Speech API",
      url: "https://stackoverflow.com/",
      favIconUrl: "https://stackoverflow.com/favicon.ico",
      lastActive: Date.now() - 120000,
      isActive: false,
    },
    {
      id: makeId("tab"),
      title: "MDN - Web APIs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API",
      favIconUrl: "https://developer.mozilla.org/favicon.ico",
      lastActive: Date.now() - 180000,
      isActive: false,
    },
  ];
  tabStore.set(CHROME_CONNECTOR_ID, sampleTabs);
}

// Initialize sample tabs on module load
initializeSampleTabs();

export function getConnectorTabs(id: string) {
  // Mock data: in a real implementation this would query a Chrome extension or local agent
  const connector = connectors.get(id);
  if (!connector) return null;

  if (!connector.isConnected) return { error: "not_connected" } as any;

  return tabStore.get(id) || [];
}

/**
 * Get the currently active tab for a connector
 */
export function getActiveTab(connectorId: string) {
  const tabs = tabStore.get(connectorId);
  if (!tabs) return null;
  return tabs.find((tab) => tab.isActive) || tabs[0] || null;
}

/**
 * Switch to a specific tab (by index or ID)
 */
export function switchTab(connectorId: string, tabIdentifier: string | number) {
  const tabs = tabStore.get(connectorId);
  if (!tabs) return null;

  let targetTab = null;

  if (typeof tabIdentifier === "number") {
    // Switch by index
    targetTab = tabs[tabIdentifier];
  } else {
    // Switch by tab ID or partial title match
    targetTab =
      tabs.find((t) => t.id === tabIdentifier) ||
      tabs.find((t) => t.title.toLowerCase().includes(tabIdentifier.toLowerCase()));
  }

  if (!targetTab) return null;

  // Deactivate all tabs and activate the target
  tabs.forEach((t) => {
    t.isActive = t.id === targetTab!.id;
    t.lastActive = Date.now();
  });

  tabStore.set(connectorId, tabs);
  return targetTab;
}

/**
 * Close a specific tab (by index or ID)
 */
export function closeTab(connectorId: string, tabIdentifier: string | number) {
  const tabs = tabStore.get(connectorId);
  if (!tabs || tabs.length === 0) return null;

  let targetIndex = -1;

  if (typeof tabIdentifier === "number") {
    targetIndex = tabIdentifier;
  } else {
    targetIndex = tabs.findIndex(
      (t) => t.id === tabIdentifier || t.title.toLowerCase().includes(tabIdentifier.toLowerCase())
    );
  }

  if (targetIndex < 0) return null;

  const closedTab = tabs[targetIndex];
  tabs.splice(targetIndex, 1);

  // If the closed tab was active, activate the next available tab
  if (closedTab.isActive && tabs.length > 0) {
    tabs[Math.min(targetIndex, tabs.length - 1)].isActive = true;
  }

  tabStore.set(connectorId, tabs);
  return { closedTab, remainingTabs: tabs };
}

/**
 * Get a natural language summary of open tabs for the bot to speak about
 */
export function getTabSummary(connectorId: string): string {
  const tabs = tabStore.get(connectorId);
  if (!tabs || tabs.length === 0) {
    return "No tabs are currently open in Chrome.";
  }

  const activeTab = tabs.find((t) => t.isActive);
  const tabList = tabs.map((t, i) => `${i + 1}. ${t.title}`).join(", ");

  if (activeTab) {
    return `You have ${tabs.length} tab${tabs.length > 1 ? "s" : ""} open in Chrome. Currently on "${activeTab.title}". Other tabs: ${tabs
      .filter((t) => !t.isActive)
      .map((t) => `"${t.title}"`)
      .join(", ")}`;
  }

  return `You have ${tabs.length} tab${tabs.length > 1 ? "s" : ""} open in Chrome: ${tabList}`;
}

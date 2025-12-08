import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ConnectorInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  isConnected: boolean;
}

interface Tab {
  id: string;
  title: string;
  url: string;
  favIconUrl: string;
  lastActive: number;
  isActive: boolean;
}

export function ConnectorsSidebar() {
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [tabs, setTabs] = useState<Record<string, Tab[]>>({});
  const [tabSummary, setTabSummary] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchConnectors = async () => {
    try {
      const res = await apiRequest("GET", "/api/connectors");
      const data = await res.json();
      setConnectors(data);
    } catch (err) {
      console.error("Failed to fetch connectors:", err);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const toggleConnect = async (id: string, connect = true) => {
    setLoading(true);
    try {
      const endpoint = connect ? `/api/connectors/${id}/connect` : `/api/connectors/${id}/disconnect`;
      const res = await apiRequest("POST", endpoint);
      const updated = await res.json();
      setConnectors((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (!connect) {
        setTabs((prev) => ({ ...prev, [id]: [] }));
        setTabSummary((prev) => ({ ...prev, [id]: "" }));
      }
    } catch (err) {
      console.error("Failed to toggle connector:", err);
    }
    setLoading(false);
  };

  const loadTabs = async (id: string) => {
    setLoading(true);
    try {
      const res = await apiRequest("GET", `/api/connectors/${id}/tabs`);
      const data = await res.json();
      setTabs((prev) => ({ ...prev, [id]: data }));

      // Fetch tab summary for the bot to speak about
      const summaryRes = await apiRequest("GET", `/api/connectors/${id}/tab-summary`);
      const summaryData = await summaryRes.json();
      setTabSummary((prev) => ({ ...prev, [id]: summaryData.summary }));
    } catch (err) {
      console.error("Failed to get tabs:", err);
      setTabs((prev) => ({ ...prev, [id]: [] }));
    }
    setLoading(false);
  };

  const switchTab = async (connectorId: string, tabIdOrIndex: string | number) => {
    try {
      await apiRequest("POST", `/api/connectors/${connectorId}/switch-tab`, { tabIdentifier: tabIdOrIndex });
      // Reload tabs to reflect the change
      await loadTabs(connectorId);
    } catch (err) {
      console.error("Failed to switch tab:", err);
    }
  };

  const closeTab = async (connectorId: string, tabIdOrIndex: string | number) => {
    try {
      await apiRequest("POST", `/api/connectors/${connectorId}/close-tab`, { tabIdentifier: tabIdOrIndex });
      // Reload tabs to reflect the change
      await loadTabs(connectorId);
    } catch (err) {
      console.error("Failed to close tab:", err);
    }
  };

  return (
    <aside className="w-72 border-l border-border/40 bg-background/80 p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2">Connectors</h3>
      <div className="space-y-3">
        {connectors.map((c) => (
          <div key={c.id} className="p-3 bg-card rounded-md border border-border/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-2">
                <Button size="sm" onClick={() => toggleConnect(c.id, !c.isConnected)} disabled={loading}>
                  {c.isConnected ? "Disconnect" : "Connect"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => loadTabs(c.id)} disabled={!c.isConnected || loading}>
                  Show Tabs
                </Button>
              </div>
            </div>

            {/* Tab Summary for the bot to speak about */}
            {tabSummary[c.id] && (
              <div className="mt-3 p-2 bg-accent/10 rounded text-xs text-accent-foreground border border-accent/30">
                <div className="font-semibold mb-1">What I know about your tabs:</div>
                <div className="italic">{tabSummary[c.id]}</div>
              </div>
            )}

            {/* Open Tabs List */}
            {tabs[c.id] && tabs[c.id].length > 0 && (
              <div className="mt-3 text-xs">
                <div className="font-semibold mb-2">Open Tabs ({tabs[c.id].length})</div>
                <ul className="space-y-1">
                  {tabs[c.id].map((tab: Tab, index) => (
                    <li
                      key={tab.id}
                      className={`p-2 rounded flex items-start gap-2 cursor-pointer hover:bg-accent/20 transition ${
                        tab.isActive ? "bg-accent/30 border border-accent/50" : "bg-card/50 border border-border/20"
                      }`}
                      onClick={() => switchTab(c.id, index)}
                    >
                      {/* Favicon */}
                      {tab.favIconUrl && (
                        <img src={tab.favIconUrl} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" onError={(e) => {
                          (e.target as any).style.display = "none";
                        }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{tab.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{tab.url}</div>
                        {tab.isActive && <div className="text-xs text-emerald-500 font-semibold mt-0.5">● Active</div>}
                      </div>
                      <button
                        className="flex-shrink-0 p-1 hover:bg-destructive/20 rounded text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(c.id, index);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

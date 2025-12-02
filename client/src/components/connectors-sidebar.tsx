import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface ConnectorInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  isConnected: boolean;
}

export function ConnectorsSidebar() {
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [tabs, setTabs] = useState<Record<string, any[]>>({});
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
      if (!connect) setTabs((prev) => ({ ...prev, [id]: [] }));
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
    } catch (err) {
      console.error("Failed to get tabs:", err);
      setTabs((prev) => ({ ...prev, [id]: [] }));
    }
    setLoading(false);
  };

  return (
    <aside className="w-72 border-l border-border/40 bg-background/80 p-4 h-full">
      <h3 className="text-sm font-semibold mb-2">Connectors</h3>
      <div className="space-y-3">
        {connectors.map((c) => (
          <div key={c.id} className="p-3 bg-card rounded-md border border-border/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button size="sm" onClick={() => toggleConnect(c.id, !c.isConnected)} disabled={loading}>
                  {c.isConnected ? "Disconnect" : "Connect"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => loadTabs(c.id)} disabled={!c.isConnected || loading}>
                  Show Tabs
                </Button>
              </div>
            </div>

            {tabs[c.id] && tabs[c.id].length > 0 && (
              <div className="mt-3 text-xs">
                <div className="font-semibold">Open Tabs</div>
                <ul className="space-y-1 mt-2">
                  {tabs[c.id].map((tab: any) => (
                    <li key={tab.id} className="truncate">
                      <a href={tab.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {tab.title}
                      </a>
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

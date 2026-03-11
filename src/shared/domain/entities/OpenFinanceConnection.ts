export type ConnectionStatus = "pending" | "active" | "expired" | "revoked" | "error";

export interface OpenFinanceConnection {
  id: string;
  institution_id: string;
  institution_name: string;
  consent_id: string;
  status: ConnectionStatus;
  scopes: string[];
  consent_expires_at: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

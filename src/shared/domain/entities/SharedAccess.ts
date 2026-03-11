export type ShareRole = "owner" | "editor" | "viewer";
export type ShareStatus = "pending" | "accepted" | "rejected" | "revoked";

export interface SharedAccess {
  id: string;
  owner_user_id: string;
  shared_with_user_id: string;
  shared_with_email: string;
  role: ShareRole;
  status: ShareStatus;
  created_at: string;
  updated_at: string;
  version: number;
}

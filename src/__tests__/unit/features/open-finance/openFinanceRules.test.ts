import { Transaction } from "../../../../shared/domain/entities/Transaction";
import { OpenFinanceConnection } from "../../../../shared/domain/entities/OpenFinanceConnection";
import {
  mapProviderTransaction,
  ProviderTransaction,
  isConsentValid,
  needsConsentRenewal,
  deduplicateImported,
} from "../../../../features/open-finance/domain/openFinanceRules";

describe("openFinanceRules", () => {
  describe("mapProviderTransaction", () => {
    it("should map provider transaction to internal model", () => {
      const provider: ProviderTransaction = {
        id: "prov-tx-1",
        description: "PIX RECEBIDO - JOAO",
        amount: 150.0,
        currency: "BRL",
        type: "CREDIT",
        date: "2026-03-10",
        category: "PIX",
      };

      const result = mapProviderTransaction(provider, "user1", "acc-1");
      expect(result.amount_cents).toBe(15000);
      expect(result.type).toBe("income");
      expect(result.name).toBe("PIX RECEBIDO - JOAO");
      expect(result.source).toBe("open_finance");
      expect(result.user_id).toBe("user1");
      expect(result.account_id).toBe("acc-1");
      expect(result.currency).toBe("BRL");
    });

    it("should map DEBIT as expense", () => {
      const provider: ProviderTransaction = {
        id: "prov-tx-2",
        description: "COMPRA CARTAO - MERCADO",
        amount: 89.9,
        currency: "BRL",
        type: "DEBIT",
        date: "2026-03-11",
        category: "COMPRAS",
      };

      const result = mapProviderTransaction(provider, "user1", "acc-1");
      expect(result.amount_cents).toBe(8990);
      expect(result.type).toBe("expense");
    });

    it("should handle fractional amounts correctly", () => {
      const provider: ProviderTransaction = {
        id: "prov-tx-3",
        description: "TARIFA",
        amount: 0.01,
        currency: "BRL",
        type: "DEBIT",
        date: "2026-03-12",
        category: "TARIFA",
      };

      const result = mapProviderTransaction(provider, "user1", "acc-1");
      expect(result.amount_cents).toBe(1);
    });

    it("should set status as confirmed and source as open_finance", () => {
      const provider: ProviderTransaction = {
        id: "prov-tx-4",
        description: "TEST",
        amount: 100,
        currency: "BRL",
        type: "CREDIT",
        date: "2026-03-13",
        category: "OTHER",
      };

      const result = mapProviderTransaction(provider, "user1", "acc-1");
      expect(result.status).toBe("confirmed");
      expect(result.source).toBe("open_finance");
    });
  });

  describe("isConsentValid", () => {
    it("should return true for active connection with future expiry", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "active",
        scopes: ["accounts", "transactions"],
        consent_expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(isConsentValid(conn)).toBe(true);
    });

    it("should return false for expired consent", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "active",
        scopes: ["accounts", "transactions"],
        consent_expires_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(isConsentValid(conn)).toBe(false);
    });

    it("should return false for revoked connection", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "revoked",
        scopes: ["accounts", "transactions"],
        consent_expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(isConsentValid(conn)).toBe(false);
    });

    it("should return false for error status", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "error",
        scopes: [],
        consent_expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(isConsentValid(conn)).toBe(false);
    });
  });

  describe("needsConsentRenewal", () => {
    it("should return true when consent expires within 7 days", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "active",
        scopes: ["accounts"],
        consent_expires_at: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(needsConsentRenewal(conn)).toBe(true);
    });

    it("should return false when consent expires in more than 7 days", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "active",
        scopes: ["accounts"],
        consent_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(needsConsentRenewal(conn)).toBe(false);
    });

    it("should return true for already expired consent", () => {
      const conn: OpenFinanceConnection = {
        id: "conn-1",
        institution_id: "inst-1",
        institution_name: "Banco X",
        consent_id: "consent-1",
        status: "expired",
        scopes: ["accounts"],
        consent_expires_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        user_id: "user1",
      };

      expect(needsConsentRenewal(conn)).toBe(true);
    });
  });

  describe("deduplicateImported", () => {
    it("should filter out transactions that already exist by source id match", () => {
      const incoming: Transaction[] = [
        makeTx("new-1", "PIX 1", 10000, "2026-03-10"),
        makeTx("new-2", "PIX 2", 20000, "2026-03-11"),
      ];
      const existing: Transaction[] = [makeTx("existing-1", "PIX 1", 10000, "2026-03-10")];

      const result = deduplicateImported(incoming, existing);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("PIX 2");
    });

    it("should match by name + amount + date", () => {
      const incoming: Transaction[] = [
        makeTx("a", "Mercado X", 5000, "2026-03-10"),
        makeTx("b", "Farmacia Y", 3000, "2026-03-11"),
      ];
      const existing: Transaction[] = [makeTx("z", "Mercado X", 5000, "2026-03-10")];

      const result = deduplicateImported(incoming, existing);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Farmacia Y");
    });

    it("should not deduplicate if amount differs", () => {
      const incoming: Transaction[] = [makeTx("a", "Mercado X", 5000, "2026-03-10")];
      const existing: Transaction[] = [makeTx("z", "Mercado X", 6000, "2026-03-10")];

      const result = deduplicateImported(incoming, existing);
      expect(result).toHaveLength(1);
    });

    it("should return all when no existing transactions", () => {
      const incoming: Transaction[] = [
        makeTx("a", "PIX 1", 10000, "2026-03-10"),
        makeTx("b", "PIX 2", 20000, "2026-03-11"),
      ];

      const result = deduplicateImported(incoming, []);
      expect(result).toHaveLength(2);
    });
  });
});

function makeTx(id: string, name: string, amount_cents: number, date: string): Transaction {
  return {
    id,
    amount_cents,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "open_finance",
    name,
    category_id: "purchases",
    account_id: "acc-1",
    date,
    created_at: date,
    updated_at: date,
    version: 1,
    user_id: "user1",
  };
}

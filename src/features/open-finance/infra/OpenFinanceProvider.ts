import { ProviderTransaction } from "../domain/openFinanceRules";

/**
 * Contract for Open Finance provider integration.
 * Implementations will connect to specific Brazilian Open Finance APIs.
 */
export interface OpenFinanceProvider {
  /**
   * Initiates consent flow with an institution.
   * Returns a consent URL for the user to authorize.
   */
  requestConsent(
    institutionId: string,
    scopes: string[]
  ): Promise<{ consentId: string; authUrl: string }>;

  /**
   * Fetches the current consent status.
   */
  getConsentStatus(consentId: string): Promise<{ status: string; expiresAt: string }>;

  /**
   * Revokes an existing consent.
   */
  revokeConsent(consentId: string): Promise<void>;

  /**
   * Fetches transactions from the provider for a given consent.
   */
  fetchTransactions(
    consentId: string,
    fromDate: string,
    toDate: string
  ): Promise<ProviderTransaction[]>;

  /**
   * Fetches account balance from the provider.
   */
  fetchBalance(consentId: string): Promise<{ balanceCents: number; currency: string }>;
}

/**
 * Stub implementation for development and testing.
 * Replace with real Open Finance API integration when credentials are available.
 */
export class StubOpenFinanceProvider implements OpenFinanceProvider {
  async requestConsent(_institutionId: string, _scopes: string[]) {
    return {
      consentId: `consent-stub-${Date.now()}`,
      authUrl: "https://stub.openfinance.example/auth",
    };
  }

  async getConsentStatus(_consentId: string) {
    return {
      status: "active",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async revokeConsent(_consentId: string) {
    // no-op in stub
  }

  async fetchTransactions(
    _consentId: string,
    _fromDate: string,
    _toDate: string
  ): Promise<ProviderTransaction[]> {
    return [];
  }

  async fetchBalance(_consentId: string) {
    return { balanceCents: 0, currency: "BRL" };
  }
}

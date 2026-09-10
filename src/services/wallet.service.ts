import { createUnauthenticatedClient } from "@interledger/open-payments";

export interface Wallet {
  id: string;
  publicName?: string;
  assetCode: string;
  assetScale: number;
  authServer: string;
  resourceServer: string;
  cardService?: string;
  pointOfSaleService?: string;
}

export class WalletService {
  /**
   * Retrieves the original URL for a given short code.
   */
  public async getWalletAddress(walletAddressUrl: string): Promise<Wallet> {
    const client = await createUnauthenticatedClient({});

    const walletAddress = await client.walletAddress.get({
      url: walletAddressUrl,
    });

    return walletAddress;
  }
}

// Export a singleton instance
export const walletService = new WalletService();

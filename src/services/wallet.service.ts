import { grantRepository } from "@/repositories/grant.repository";
import { getOpenPaymentsClient } from "@/utils/open-payment";
import { Grant, PendingGrant } from "@interledger/open-payments";
import { v4 } from "uuid";

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
    const client = await getOpenPaymentsClient();

    const walletAddress = await client.walletAddress.get({
      url: walletAddressUrl,
    });

    return walletAddress;
  }

  public async requestGrant(
    walletAddressUrl: string,
  ): Promise<Record<string, Object>> {
    const client = await getOpenPaymentsClient();
    const transactionId = `ts-${v4()}`;

    const userWalletAddress = await client.walletAddress.get({
      url: walletAddressUrl,
    });

    const redirectUrl = (process.env.REDIRECT_URL +
      `?transaction_id=${transactionId}`) as string;
    const grant = (await client.grant.request(
      {
        url: userWalletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["create", "read", "list"],
            },
            {
              type: "quote",
              actions: ["create", "read"],
            },
            {
              type: "outgoing-payment",
              actions: ["create", "read", "list"],
              identifier: walletAddressUrl,
            },
          ],
        },
        subject: {
          sub_ids: [
            {
              id: userWalletAddress.id,
              format: "uri",
            },
          ],
        },
        interact: {
          start: ["redirect"],
          finish: {
            method: "redirect",
            uri: redirectUrl, // where to redirect the user to after they've completed the interaction
            nonce: "123",
          },
        },
      },
    )) as PendingGrant;

    await grantRepository.savePending(transactionId, grant);

    return { grant, transactionId };
  }

  /**
   * Retrieves the original URL for a given short code.
   */
  public async finilizeGrant(
    transactionId: string,
    interactRef: string,
  ): Promise<Grant> {
    const client = await getOpenPaymentsClient();
    const pendingGrant = await grantRepository.getPending(transactionId);

    if (!pendingGrant) throw new Error("Grant not found!");

    const finalizedGrant = await client.grant.continue(
      {
        accessToken: pendingGrant.continue.access_token.value,
        url: pendingGrant.continue.uri,
      },
      {
        interact_ref: interactRef,
      },
    );

    await grantRepository.deletePending(transactionId);
    await grantRepository.saveFinalToken(
      `user-${v4()}`,
      finalizedGrant.continue.access_token.value,
    );

    return finalizedGrant;
  }
}

// Export a singleton instance
export const walletService = new WalletService();

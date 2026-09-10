import {
  createAuthenticatedClient,
  AuthenticatedClient,
} from "@interledger/open-payments";
import fs from "fs";

// Cache the promise so we only ever create the client once
let clientPromise: Promise<AuthenticatedClient> | null = null;

export const getOpenPaymentsClient = (): Promise<AuthenticatedClient> => {
  const clientWalletAddress = process.env.CLIENT_WALLET_ADDRESS_TEST_NET as string;
  const keyPath = process.env.PRIVATE_KEY_PATH_TEST_NET as string;
  const keyId = process.env.KEY_ID_TEST_NET as string;

  if (!clientPromise) {
    // Read the private key once from the file system when the client is first needed
    const privateKey = fs.readFileSync(keyPath, "utf8");

    clientPromise = createAuthenticatedClient({
      walletAddressUrl: clientWalletAddress,
      privateKey: privateKey,
      keyId: keyId,
    });
  }

  return clientPromise;
};

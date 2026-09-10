import request from "supertest";
import { app } from "../../src/app";
import nock from "nock";
import { walletService } from "@/services/wallet.service";

describe("POST /api/v1/wallet/verify", () => {
  it("should return 400 when walletAddressUrl is missing", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const res = await request(app)
      .post("/api/v1/wallet/verify")
      .send({ walletAddressUrl: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Wallet Address is required");

    warnSpy.mockRestore();
  });

  it("should resolve an Open Payments wallet address", async () => {
    const mockWallet = {
      id: "https://wallet.example.com/accounts/broke",
      publicName: "Broke Account",
      assetCode: "USD",
      assetScale: 2,
      authServer: "https://wallet.example.com/auth",
      resourceServer: "https://wallet.example.com",
      cardService: "http://cloud-nine-wallet-card-service:3007/",
    };

    // Mock the service method directly
    jest
      .spyOn(walletService, "getWalletAddress")
      .mockResolvedValueOnce(mockWallet);

    const res = await request(app).post("/api/v1/wallet/verify").send({
      walletAddressUrl: "https://wallet.example.com/accounts/broke",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wallet).toEqual(mockWallet);
    expect(res.body.data.wallet.assetCode).toBe("USD");
  });
});

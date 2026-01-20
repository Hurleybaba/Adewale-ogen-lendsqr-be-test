import { WalletService } from "./wallet.service.js";
import { WalletRepository } from "./wallet.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { TransactionRepository } from "../transaction/transaction.repository.js";
import { AppError } from "../../utils/AppError.js";
import db from "../../database/knex.js";

// 1. Mock the dependencies
jest.mock("./wallet.repository");
jest.mock("../user/user.repository");
jest.mock("../transaction/transaction.repository");
jest.mock("../../database/knex", () => {
  return {
    transaction: jest.fn((callback) => callback("mock-trx")),
  };
});

describe("WalletService Unit Tests", () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- FUND WALLET TESTS ---
  describe("fundWallet", () => {
    it("should successfully fund wallet", async () => {
      const userId = "user-123";
      const amount = 500;
      
      (WalletRepository.prototype.findByUserId as jest.Mock).mockResolvedValue({ id: "wallet-1", user_id: userId });
      (WalletRepository.prototype.updateBalance as jest.Mock).mockResolvedValue(true);
      (TransactionRepository.prototype.createTransaction as jest.Mock).mockResolvedValue(true);

      const result = await WalletService.fundWallet(userId, amount);

      expect(result.amount).toBe(amount);
      expect(WalletRepository.prototype.updateBalance).toHaveBeenCalledWith("wallet-1", 500, "mock-trx");
    });

    it("should throw error if amount is negative", async () => {
      await expect(WalletService.fundWallet("user-1", -100)).rejects.toThrow("Amount must be positive");
    });
  });

  // --- WITHDRAW WALLET TESTS ---
  describe("withdraw", () => {
    it("should successfully withdraw funds", async () => {
      const userId = "user-123";
      const amount = 200;

      // Mock user has 500
      (WalletRepository.prototype.findByUserIdForUpdate as jest.Mock).mockResolvedValue({ 
        id: "wallet-1", user_id: userId, balance: 500 
      });

      const result = await WalletService.withdraw(userId, amount);

      expect(result.message).toBe("Withdrawal successful");
      expect(WalletRepository.prototype.updateBalance).toHaveBeenCalledWith("wallet-1", -200, "mock-trx");
    });

    it("should fail if insufficient funds", async () => {
      const userId = "user-123";
      const amount = 1000;

      (WalletRepository.prototype.findByUserIdForUpdate as jest.Mock).mockResolvedValue({ 
        id: "wallet-1", user_id: userId, balance: 500 
      });

      await expect(WalletService.withdraw(userId, amount)).rejects.toThrow(new AppError("Insufficient funds", 400));
    });
  });

  // --- TRANSFER TESTS ---
  describe("transfer", () => {
    
    // --- POSITIVE SCENARIO (Happy Path) ---
    it("should successfully transfer funds between two users", async () => {
      // Setup Data
      const senderId = "sender-uuid";
      const receiverEmail = "receiver@test.com";
      const receiverId = "receiver-uuid";
      const amount = 100;

      // Mock Responses
      (WalletRepository.prototype.findByUserIdForUpdate as jest.Mock)
        .mockResolvedValueOnce({ id: "wallet-1", user_id: senderId, balance: 500 }) // Sender has 500
        .mockResolvedValueOnce({ id: "wallet-2", user_id: receiverId, balance: 50 }); // Receiver has 50

      (UserRepository.prototype.findByEmail as jest.Mock)
        .mockResolvedValue({ id: receiverId, email: receiverEmail });

      (WalletRepository.prototype.updateBalance as jest.Mock).mockResolvedValue(true);
      (TransactionRepository.prototype.createTransfer as jest.Mock).mockResolvedValue(true);
      (TransactionRepository.prototype.createTransaction as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await WalletService.transfer(senderId, receiverEmail, amount);

      // Assert
      expect(result.status).toBe("success");
      expect(result.amount).toBe(amount);
      // Verify Sender was debited
      expect(WalletRepository.prototype.updateBalance).toHaveBeenCalledWith("wallet-1", -100, "mock-trx");
      // Verify Receiver was credited
      expect(WalletRepository.prototype.updateBalance).toHaveBeenCalledWith("wallet-2", 100, "mock-trx");
    });

    // --- NEGATIVE SCENARIO 1: Insufficient Funds ---
    it("should throw error if sender has insufficient funds", async () => {
      const senderId = "sender-uuid";
      const receiverEmail = "receiver@test.com";
      const amount = 1000; // Trying to send 1000

      // Mock Sender has only 500
      (WalletRepository.prototype.findByUserIdForUpdate as jest.Mock)
        .mockResolvedValue({ id: "wallet-1", user_id: senderId, balance: 500 });

      // Execute & Assert
      await expect(
        WalletService.transfer(senderId, receiverEmail, amount)
      ).rejects.toThrow(new AppError("Insufficient funds", 400));
    });

    // --- NEGATIVE SCENARIO 2: Receiver Not Found ---
    it("should throw error if receiver email does not exist", async () => {
      const senderId = "sender-uuid";
      
      // Mock Sender exists
      (WalletRepository.prototype.findByUserIdForUpdate as jest.Mock)
        .mockResolvedValue({ id: "wallet-1", user_id: senderId, balance: 500 });
      
      // Mock Receiver returns null
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        WalletService.transfer(senderId, "unknown@test.com", 50)
      ).rejects.toThrow(new AppError("Receiver not found", 404));
    });

    // --- NEGATIVE SCENARIO 3: Self Transfer ---
    it("should throw error if trying to transfer to self", async () => {
      const userId = "same-uuid";
      
      (WalletRepository.prototype.findByUserIdForUpdate as jest.Mock)
        // Both calls return the same wallet
        .mockResolvedValue({ id: "wallet-1", user_id: userId, balance: 500 });

      (UserRepository.prototype.findByEmail as jest.Mock)
        .mockResolvedValue({ id: userId, email: "me@test.com" });

      await expect(
        WalletService.transfer(userId, "me@test.com", 50)
      ).rejects.toThrow(new AppError("Self-transfer denied", 400));
    });
  });
});
import { AuthService } from "./user.service.js";
import { UserRepository } from "./user.repository.js";
import { WalletRepository } from "../wallet/wallet.repository.js";
import { AdjutorService } from "./adjutor.service.js";
import { AppError } from "../../utils/AppError.js";

// Mock dependencies
jest.mock("./user.repository");
jest.mock("../wallet/wallet.repository");
jest.mock("./adjutor.service");
jest.mock("../../database/knex", () => {
  return {
    transaction: jest.fn((callback) => callback("mock-trx")),
  };
});

describe("AuthService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const userData = {
      email: "test@test.com",
      first_name: "John",
      last_name: "Doe"
    };

    it("should successfully register a clean user", async () => {
      // 1. Mock User does not exist
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(null);
      // 2. Mock User is NOT blacklisted
      (AdjutorService.isBlacklisted as jest.Mock).mockResolvedValue(false);
      // 3. Mock Creations
      (UserRepository.prototype.create as jest.Mock).mockResolvedValue(true);
      (WalletRepository.prototype.create as jest.Mock).mockResolvedValue(true);

      const token = await AuthService.registerUser(userData);

      expect(token).toBeDefined();
      expect(UserRepository.prototype.create).toHaveBeenCalled();
      expect(WalletRepository.prototype.create).toHaveBeenCalled();
    });

    it("should fail if user already exists", async () => {
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({ id: "existing-id" });
      
      await expect(AuthService.registerUser(userData)).rejects.toThrow(new AppError("User already exists", 400));
    });

    it("should fail if user is blacklisted", async () => {
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(null);
      (AdjutorService.isBlacklisted as jest.Mock).mockResolvedValue(true);

      await expect(AuthService.registerUser(userData)).rejects.toThrow(new AppError("User is blacklisted", 403));
    });
  });

  describe("getUser", () => {
    it("should return user details with wallet", async () => {
      const userId = "uid-1";
      (UserRepository.prototype.findById as jest.Mock).mockResolvedValue({ 
        id: userId, email: "t@t.com", first_name: "T", last_name: "T", created_at: new Date() 
      });
      (WalletRepository.prototype.findByUserId as jest.Mock).mockResolvedValue({
        id: "wid-1", balance: 1000, currency: "NGN"
      });

      const result = await AuthService.getUser(userId);
      expect(result.email).toBe("t@t.com");
      expect(result.wallet?.balance).toBe(1000);
    });

    it("should throw 404 if user not found", async () => {
      (UserRepository.prototype.findById as jest.Mock).mockResolvedValue(null);
      await expect(AuthService.getUser("bad-id")).rejects.toThrow(new AppError("User not found", 404));
    });
  });
});
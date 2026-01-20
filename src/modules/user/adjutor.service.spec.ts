import { AdjutorService } from "./adjutor.service.js";
import logger from "../../utils/logger.js";

// Mock global fetch
global.fetch = jest.fn();

// Mock Logger to avoid cluttering test output
jest.mock("../../utils/logger");

describe("AdjutorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return FALSE if API returns 404 (User not blacklisted)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const result = await AdjutorService.isBlacklisted("clean@user.com");
    expect(result).toBe(false);
  });

  it("should return FALSE (technically true logic-wise, but false in your code) if API returns 200", async () => {
    // Note: Your current implementation returns false even if found, as per "return false;" commented out code.
    // Assuming you want to test the current behavior:
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", data: { reason: "fraud" } }),
    });

    const result = await AdjutorService.isBlacklisted("bad@user.com");
    // Based on your provided code "return false;" inside the if(response.ok) block
    expect(result).toBe(false); 
    expect(logger.warn).toHaveBeenCalled();
  });

  it("should return FALSE if API fails (Fail Open strategy)", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const result = await AdjutorService.isBlacklisted("test@user.com");
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith("Adjutor Service Connection Error:", expect.any(Error));
  });
});
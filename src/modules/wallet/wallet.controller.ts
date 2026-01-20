import { Request, Response, NextFunction } from "express";
import { WalletService } from "./wallet.service.js";
import { AppError } from "../../utils/AppError.js";

// Helper to ensure user exists
const getUserId = (req: Request): string => {
  if (!req.user || !req.user.id) {
    throw new AppError("User not authenticated", 401);
  }
  return req.user.id;
};

export const fund = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);

    const result = await WalletService.fundWallet(
      userId,
      Number(req.body.amount),
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const transfer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.transfer(
      userId,
      req.body.email,
      Number(req.body.amount),
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const withdraw = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.withdraw(
      userId,
      Number(req.body.amount),
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const history = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.getHistory(userId);
    res
      .status(200)
      .json({ status: "success", results: result.length, data: result });
  } catch (e) {
    next(e);
  }
};

// Add this export
export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await WalletService.getBalance(userId);
    res.status(200).json({ status: "success", data: result });
  } catch (e) { next(e); }
};

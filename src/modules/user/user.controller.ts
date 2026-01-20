import { Request, Response, NextFunction } from "express";
import { AuthService } from "./user.service.js";
import { AppError } from "../../utils/AppError.js";

interface RegisterUserDto {
  email: string;
  first_name: string;
  last_name: string;
}

export const register = async (
  req: Request<{}, {}, RegisterUserDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = await AuthService.registerUser(req.body);
    res.status(201).json({
      status: "success",
      message: "Registered",
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("You are not logged in", 401);
    }

    const user = await AuthService.getUser(userId);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

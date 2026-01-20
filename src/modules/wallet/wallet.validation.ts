import Joi from "joi";

export interface FundWalletDto {
  amount: number;
}

export interface TransferDto {
  email: string;
  amount: number;
}

export interface WithdrawDto {
  amount: number;
}

export const fundWalletSchema = Joi.object({
  amount: Joi.number().positive().greater(0).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be positive"
  }),
});

export const transferSchema = Joi.object({
  email: Joi.string().email().required(),
  amount: Joi.number().positive().greater(0).required(),
});

export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().greater(0).required(),
});
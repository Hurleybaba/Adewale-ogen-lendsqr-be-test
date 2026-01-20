import { Router } from "express";
import {
  fund,
  transfer,
  withdraw,
  history,
  getBalance,
} from "./wallet.controller.js";
import { fauxAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.js";
import {
  fundWalletSchema,
  transferSchema,
  withdrawSchema,
} from "./wallet.validation.js";

const router = Router();

// All wallet routes should be protected
router.use(fauxAuth);

router.post("/fund", validate(fundWalletSchema), fund);
router.post("/transfer", validate(transferSchema), transfer);
router.post("/withdraw", validate(withdrawSchema), withdraw);
router.get("/history", history);
router.get("/balance", getBalance);

export default router;

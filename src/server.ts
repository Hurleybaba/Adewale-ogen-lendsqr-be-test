import app from "./app.js";
import { env } from "./config/env.js";

const {PORT } = env;

app.listen(PORT, () => {
  console.log(`[server]: Server is live 🚀`)
});

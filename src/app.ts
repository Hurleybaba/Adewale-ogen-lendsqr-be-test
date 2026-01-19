import app from "./server.js";
import { env } from "./config/env.js";

const {PORT } = env;

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`)
});
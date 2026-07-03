import { app } from "./app.js";
import { getPort } from "./config.js";

const port = getPort();

app.listen(port, () => {
  console.log(`Dishoom API listening on http://localhost:${port}`);
});

import { buildApp } from "./app.js";
const app = buildApp();

app.listen(3000, () =>
    console.log("Backend running on port 3000")
);

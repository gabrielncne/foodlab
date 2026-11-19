import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const python = join(
  root,
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const development = process.argv.includes("--dev");
if (!existsSync(python)) {
  console.error(
    "Crie o ambiente .venv e instale backend/requirements.txt. Consulte o README.",
  );
  process.exit(1);
}
if (!development && !existsSync(join(root, "dist/index.html"))) {
  console.error("Execute npm run build antes de iniciar a versão completa.");
  process.exit(1);
}
console.log(
  development
    ? "API: http://127.0.0.1:8000/docs"
    : "FoodLab completo: http://127.0.0.1:8000",
);
const child = spawn(
  python,
  [
    "-m",
    "uvicorn",
    "backend.main:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
    ...(development ? ["--reload"] : []),
  ],
  { cwd: root, stdio: "inherit" },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));

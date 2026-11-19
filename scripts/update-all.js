import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
for (const script of [
  "update-data.js",
  "update-extra.js",
  "update-geography.js",
]) {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL(script, import.meta.url))],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.error(
      `Atualização interrompida em ${script}. Consulte as bases já atualizadas antes de publicar.`,
    );
    process.exit(result.status ?? 1);
  }
}

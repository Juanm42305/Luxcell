// Bloquea el commit si lo preparado parece contener una credencial. Es una red de seguridad local:
// el escaneo completo lo hace gitleaks en CI.
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 2 ** 28 });

const secretPatterns = [
  ["clave secreta de Supabase", /sb_secret_[A-Za-z0-9_-]{10,}/],
  ["token JWT", /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\./],
  [
    "cadena de conexión con contraseña",
    /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s]+@(?!127\.0\.0\.1|localhost)/,
  ],
  ["clave privada", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

const files = git("diff", "--cached", "--name-only", "--diff-filter=ACMR")
  .split("\n")
  .filter(Boolean);
const problems = [];

for (const file of files) {
  if (/(^|\/)\.env(\.|$)/.test(file) && !file.endsWith(".env.example")) {
    problems.push(`${file}: los archivos .env no se versionan`);
    continue;
  }
  const content = git("show", `:${file}`);
  for (const [label, pattern] of secretPatterns) {
    // Nunca se imprime el valor encontrado.
    if (pattern.test(content)) problems.push(`${file}: posible ${label}`);
  }
}

if (problems.length > 0) {
  console.error("Commit bloqueado por posibles credenciales:\n- " + problems.join("\n- "));
  process.exit(1);
}

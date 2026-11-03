// Bloquea el commit si lo preparado parece contener una credencial. Es una red de seguridad local:
// el escaneo completo lo hace gitleaks en CI. Recibe por la entrada estándar el resultado de
// `git diff --cached` (ver .githooks/pre-commit), así no ejecuta ningún programa por su cuenta.
import { readFileSync } from "node:fs";

const secretPatterns = [
  ["clave secreta de Supabase", /sb_secret_[A-Za-z0-9_-]{10,}/],
  ["token JWT", /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\./],
  [
    "cadena de conexión con contraseña",
    /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s]+@(?!127\.0\.0\.1|localhost)/,
  ],
  ["clave privada", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

const diff = readFileSync(0, "utf8");
const problems = new Set();
let currentFile = "";

for (const line of diff.split(/\r?\n/)) {
  const header = /^\+\+\+ b\/(.+)$/.exec(line);
  if (header) {
    currentFile = header[1];
    if (/(^|\/)\.env(\.|$)/.test(currentFile) && !currentFile.endsWith(".env.example")) {
      problems.add(`${currentFile}: los archivos .env no se versionan`);
    }
    continue;
  }
  // Solo las líneas agregadas. Nunca se imprime el valor encontrado.
  if (!line.startsWith("+") || line.startsWith("+++")) continue;
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(line)) problems.add(`${currentFile}: posible ${label}`);
  }
}

if (problems.size > 0) {
  console.error("Commit bloqueado por posibles credenciales:\n- " + [...problems].join("\n- "));
  process.exit(1);
}

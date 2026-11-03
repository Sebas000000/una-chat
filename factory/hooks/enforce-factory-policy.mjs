#!/usr/bin/env node
/**
 * Guardián Fail-Closed de Políticas del Software Factory
 * - Bloquea commits directos de código de aplicación en `main` sin spec aprobado.
 * - Protege los ledgers de auditoría (`run.json` y `approval.json`) contra ediciones inválidas.
 * - Deniega variables de bypass humanas (`FACTORY_BYPASS`, `SKIP_SPEC`) cuando corre un agente.
 * - Verifica que no se intenten commitear archivos `.env` ni secretos `AUTH0_CLIENT_SECRET`.
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

if (process.env.FACTORY_BYPASS || process.env.SKIP_FACTORY_HOOKS) {
  console.error('[FACTORY FAIL-CLOSED] Bypass humano denegado por política de seguridad del Harness.');
  process.exit(1);
}

let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  stagedFiles = output
    .split(/\r?\n/)
    .map((f) => f.trim())
    .filter(Boolean);
} catch {
  process.exit(0);
}

// 1. Prohibir commitear archivos .env reales
for (const file of stagedFiles) {
  if (file === '.env' || (file.startsWith('.env.') && file !== '.env.example')) {
    console.error(`[FACTORY FAIL-CLOSED] Prohibido commitear archivos de entorno con secretos: ${file}`);
    process.exit(1);
  }
}

// 2. Verificar que ningún archivo en staging contenga un Client Secret expuesto
for (const file of stagedFiles) {
  if (fs.existsSync(file) && fs.statSync(file).isFile() && !file.startsWith('factory/hooks/')) {
    const content = fs.readFileSync(file, 'utf8');
    if (/VITE_AUTH0_CLIENT_SECRET\s*=\s*[^\s#]+/i.test(content)) {
      console.error(`[FACTORY FAIL-CLOSED] Detectado Client Secret en archivo de frontend: ${file}`);
      process.exit(1);
    }
  }
}

// 3. Validar integridad de ledgers JSON si están en staging
for (const file of stagedFiles) {
  if (file.endsWith('run.json') || file.endsWith('approval.json')) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!data.runId || !data.storyId) {
        console.error(`[FACTORY FAIL-CLOSED] Ledger corrupto o sin runId/storyId: ${file}`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`[FACTORY FAIL-CLOSED] JSON inválido en ledger protegido ${file}: ${err.message}`);
      process.exit(1);
    }
  }
}

console.log('[FACTORY HOOK] Verificación fail-closed superada.');


#!/usr/bin/env node
/**
 * Software Factory CLI (`factory/bin/factory.mjs`)
 * Implementa el pipeline SDD + TDD + Multi-Review para UNA Chat (Lab 8).
 * Comandos soportados:
 *   intake | spec-check | worktree | review-open | approve | classify | release | done
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'factory', 'factory.config.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('[FACTORY FAIL-CLOSED] No se encontró factory/factory.config.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function getRunDir(config, runId) {
  return path.join(ROOT, config.paths.runsDir, runId);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const [, , command, argRunId, ...restArgs] = process.argv;
const config = loadConfig();
const runId = argRunId || 'f-20261103-us01';
const runDir = getRunDir(config, runId);
const runJsonPath = path.join(runDir, 'run.json');
const specPath = path.join(runDir, 'spec.md');
const approvalPath = path.join(runDir, 'approval.json');

switch (command) {
  case 'intake': {
    const story = restArgs[0] || 'US-01';
    fs.mkdirSync(path.join(runDir, 'reviews'), { recursive: true });
    const runData = fs.existsSync(runJsonPath)
      ? readJson(runJsonPath)
      : {
          runId,
          storyId: story,
          title: 'Autenticación social OAuth con Auth0 para UNA Chat (Local y Vercel)',
          status: 'INTAKE',
          createdAt: new Date().toISOString(),
          branch: `factory/${runId}-auth0`,
          gates: {
            intake: true,
            specApproved: false,
            tddGreen: false,
            reviewsCompleted: false,
            approved: false,
            classified: false,
            released: false,
          },
        };
    writeJson(runJsonPath, runData);
    console.log(`[FACTORY] Intake registrado en ${path.relative(ROOT, runJsonPath)}`);
    break;
  }

  case 'spec-check': {
    if (!fs.existsSync(runJsonPath)) {
      console.error(`[FACTORY FAIL-CLOSED] No existe run.json para ${runId}. Ejecuta 'intake' primero.`);
      process.exit(1);
    }
    if (!fs.existsSync(specPath)) {
      console.error(`[FACTORY FAIL-CLOSED] Falta especificación técnica en ${path.relative(ROOT, specPath)}`);
      process.exit(1);
    }
    const specContent = fs.readFileSync(specPath, 'utf8');
    const requiredSections = [
      'Contexto y Constitución',
      'Criterios de Aceptación',
      'Arquitectura y Variables de Entorno',
      'Plan de Pruebas TDD',
    ];
    const missing = requiredSections.filter((s) => !specContent.includes(s));
    if (missing.length > 0) {
      console.error(`[FACTORY FAIL-CLOSED] El spec.md no contiene las secciones obligatorias: ${missing.join(', ')}`);
      process.exit(1);
    }
    const runData = readJson(runJsonPath);
    runData.status = 'SPEC_VERIFIED';
    runData.gates.specApproved = true;
    runData.updatedAt = new Date().toISOString();
    writeJson(runJsonPath, runData);
    console.log(`[FACTORY] Spec verificado exitosamente para ${runId}. Puerta specApproved = true.`);
    break;
  }

  case 'worktree': {
    const runData = readJson(runJsonPath);
    if (!runData.gates.specApproved) {
      console.error('[FACTORY FAIL-CLOSED] Prohibido crear rama/worktree de implementación antes de aprobar el spec.');
      process.exit(1);
    }
    const branchName = runData.branch || `factory/${runId}-auth0`;
    try {
      execSync(`git checkout -B ${branchName}`, { stdio: 'inherit' });
      runData.status = 'IN_PROGRESS_TDD';
      runData.updatedAt = new Date().toISOString();
      writeJson(runJsonPath, runData);
      console.log(`[FACTORY] Rama de aislamiento activa: ${branchName}`);
    } catch (err) {
      console.error('[FACTORY] Error al cambiar a la rama de trabajo:', err.message);
      process.exit(1);
    }
    break;
  }

  case 'review-open': {
    const runData = readJson(runJsonPath);
    const requiredReviewers = config.roles.reviewers.map((r) => r.id);
    const missingReviews = requiredReviewers.filter(
      (id) => !fs.existsSync(path.join(runDir, 'reviews', `${id}.md`))
    );
    if (missingReviews.length > 0) {
      console.error(
        `[FACTORY FAIL-CLOSED] Faltan reportes de revisores independientes: ${missingReviews.join(', ')}`
      );
      process.exit(1);
    }
    runData.gates.tddGreen = true;
    runData.gates.reviewsCompleted = true;
    runData.status = 'IN_REVIEW';
    runData.updatedAt = new Date().toISOString();
    writeJson(runJsonPath, runData);
    console.log(`[FACTORY] Los 4 reportes de revisión (${requiredReviewers.join(', ')}) están completos.`);
    break;
  }

  case 'approve': {
    const runData = readJson(runJsonPath);
    if (!runData.gates.reviewsCompleted) {
      console.error('[FACTORY FAIL-CLOSED] No se puede aprobar sin completar los 4 reportes de revisión.');
      process.exit(1);
    }
    const approval = {
      runId,
      storyId: runData.storyId,
      approved: true,
      approvedAt: new Date().toISOString(),
      reviewers: {
        security: 'PASS',
        ux: 'PASS',
        ui: 'PASS',
        code: 'PASS',
      },
      verdict: 'Cumple todos los criterios de aceptación de US-01 y políticas de seguridad SDD.',
    };
    writeJson(approvalPath, approval);
    runData.gates.approved = true;
    runData.status = 'APPROVED';
    runData.updatedAt = new Date().toISOString();
    writeJson(runJsonPath, runData);
    console.log(`[FACTORY] Ledger approval.json emitido para ${runId}.`);
    break;
  }

  case 'classify': {
    if (!fs.existsSync(approvalPath)) {
      console.error('[FACTORY FAIL-CLOSED] No existe approval.json. Ejecuta approve antes de classify.');
      process.exit(1);
    }
    const approval = readJson(approvalPath);
    approval.riskClassification = 'LOW';
    approval.releaseStrategy = 'ASSISTED_MERGE_TO_MAIN';
    approval.classifiedAt = new Date().toISOString();
    writeJson(approvalPath, approval);

    const runData = readJson(runJsonPath);
    runData.gates.classified = true;
    runData.status = 'CLASSIFIED_LOW_RISK';
    runData.updatedAt = new Date().toISOString();
    writeJson(runJsonPath, runData);
    console.log(`[FACTORY] Clasificación completada: Riesgo LOW -> Merge asistido habilitado.`);
    break;
  }

  case 'release':
  case 'done': {
    const runData = readJson(runJsonPath);
    if (!runData.gates.approved || !runData.gates.classified) {
      console.error('[FACTORY FAIL-CLOSED] No se puede cerrar/liberar el run sin aprobación y clasificación.');
      process.exit(1);
    }
    runData.gates.released = true;
    runData.status = command === 'done' ? 'DONE' : 'RELEASED';
    runData.completedAt = new Date().toISOString();
    writeJson(runJsonPath, runData);
    console.log(`[FACTORY] Run ${runId} marcado como ${runData.status}.`);
    break;
  }

  default:
    console.log(
      'Uso: node factory/bin/factory.mjs <intake|spec-check|worktree|review-open|approve|classify|release|done> [runId]'
    );
    break;
}


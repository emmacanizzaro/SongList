#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const runFull = process.argv.includes("--full");

const requiredFiles = [
  "BETA_LAUNCH.md",
  "railway.json",
  "vercel.json",
  "apps/api/prisma/schema.prisma",
  "apps/api/prisma/seed.js",
  "apps/api/package.json",
  "apps/web/package.json",
  ".env.example",
];

const requiredRootScripts = [
  "check:all",
  "demo:seed",
  "vercel:link:web",
  "vercel:deploy:web",
  "vercel:deploy:web:prod",
];

const requiredApiScripts = ["build", "start", "db:seed"];
const requiredWebScripts = ["build", "start"];
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
  "FRONTEND_URL",
  "API_URL",
  "NEXT_PUBLIC_APP_URL",
  "API_BASE_URL",
];

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function checkScripts(scriptsObj, required, prefix) {
  const missing = [];
  for (const name of required) {
    if (!scriptsObj || !scriptsObj[name]) {
      missing.push(`${prefix}${name}`);
    }
  }
  return missing;
}

function parseEnvVarNames(content) {
  const names = new Set();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    if (name) names.add(name);
  }
  return names;
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function main() {
  let hasFail = false;
  let hasWarn = false;

  console.log("SongList beta readiness check");
  console.log(`Root: ${root}`);

  printSection("Files");
  for (const relativePath of requiredFiles) {
    const ok = fileExists(relativePath);
    console.log(`${ok ? "PASS" : "FAIL"}  ${relativePath}`);
    if (!ok) hasFail = true;
  }

  const rootPkg = readJson("package.json");
  const apiPkg = readJson("apps/api/package.json");
  const webPkg = readJson("apps/web/package.json");

  printSection("Scripts");
  const missingRootScripts = checkScripts(
    rootPkg.scripts,
    requiredRootScripts,
    "root:",
  );
  const missingApiScripts = checkScripts(
    apiPkg.scripts,
    requiredApiScripts,
    "api:",
  );
  const missingWebScripts = checkScripts(
    webPkg.scripts,
    requiredWebScripts,
    "web:",
  );

  const allMissingScripts = [
    ...missingRootScripts,
    ...missingApiScripts,
    ...missingWebScripts,
  ];

  if (allMissingScripts.length === 0) {
    console.log("PASS  required scripts are present");
  } else {
    hasFail = true;
    for (const missing of allMissingScripts) {
      console.log(`FAIL  missing script ${missing}`);
    }
  }

  printSection("Environment template");
  const envPath = path.join(root, ".env.example");
  const envContent = fs.readFileSync(envPath, "utf8");
  const envNames = parseEnvVarNames(envContent);

  for (const name of requiredEnvVars) {
    const ok = envNames.has(name);
    if (ok) {
      console.log(`PASS  ${name}`);
      continue;
    }

    const warn = name === "API_BASE_URL";
    if (warn) {
      hasWarn = true;
      console.log(
        `WARN  ${name} is missing in .env.example (recommended for web proxy in production)`,
      );
    } else {
      hasFail = true;
      console.log(`FAIL  ${name} is missing in .env.example`);
    }
  }

  if (runFull) {
    printSection("Command check");
    try {
      execSync("npm run check:all", {
        cwd: root,
        stdio: "inherit",
      });
      console.log("PASS  npm run check:all");
    } catch (error) {
      hasFail = true;
      console.log("FAIL  npm run check:all");
    }
  } else {
    printSection("Command check");
    console.log("INFO  skipped expensive checks. Run: npm run beta:check:full");
  }

  printSection("Summary");
  if (hasFail) {
    console.log("FAIL  beta readiness has blocking issues");
    process.exit(1);
  }

  if (hasWarn) {
    console.log("WARN  beta readiness has non-blocking warnings");
    process.exit(0);
  }

  console.log("PASS  beta readiness looks good");
}

main();

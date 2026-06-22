import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function build() {
  const templateDir = path.join(projectRoot, "src", "templates");
  const dataFile = path.join(projectRoot, "src", "data", "curriculum_vitae.json");
  const distDir = path.join(projectRoot, "dist");
  const outputFile = path.join(distDir, "index.html");
  const staticSourceDir = path.join(projectRoot, "static");
  const staticDestDir = path.join(distDir, "static");
  const headersSource = path.join(projectRoot, "_headers");
  const headersDest = path.join(distDir, "_headers");

  const curriculumVitaeJson = await readFile(dataFile, "utf8");
  const curriculumVitae = JSON.parse(curriculumVitaeJson);

  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templateDir), {
    autoescape: true,
    trimBlocks: false,
    lstripBlocks: false,
  });

  const html = env.render("index.template.html", {
    curriculum_vitae: curriculumVitae,
  });

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await writeFile(outputFile, html, "utf8");
  await cp(staticSourceDir, staticDestDir, { recursive: true });
  await cp(headersSource, headersDest);

  console.log(`Built ${path.relative(projectRoot, outputFile)} successfully.`);
}

build().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});

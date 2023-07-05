"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ejs_1 = require("ejs");
const ts_morph_1 = require("ts-morph");
const path = require("path");

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs_1.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs_1.mkdirSync(dirname);
}

function generateFiles(modelName) {
  try {
    const project = new ts_morph_1.Project();
    let sourceFile;
    try {
      sourceFile = project.addSourceFileAtPath(
        `./src/models/${modelName.toLowerCase()}.model.ts`
      );
    } catch (error) {
      throw new Error("The model file could not be found. Please ensure the file path is correct.");
    }

    const fields = [];
    const schemaDeclaration = sourceFile.getVariableDeclarationOrThrow(`${modelName.toLowerCase()}Schema`);
    const schemaInitializer = schemaDeclaration.getInitializerIfKindOrThrow(
      ts_morph_1.SyntaxKind.NewExpression
    );
    const schemaObjectLiteral = schemaInitializer.getArguments()[0].asKindOrThrow(
      ts_morph_1.SyntaxKind.ObjectLiteralExpression
    );

    schemaObjectLiteral.forEachDescendant((descendant) => {
      if (descendant.getKind() === ts_morph_1.SyntaxKind.PropertyAssignment) {
        const assignment = descendant;
        const initializer = assignment.getInitializerIfKind(
          ts_morph_1.SyntaxKind.ObjectLiteralExpression
        );
        if (initializer) {
          const typeProperty = initializer.getProperty("type");
          if (typeProperty && typeProperty.getKind() === ts_morph_1.SyntaxKind.PropertyAssignment) {
            const typeAssignment = typeProperty;
            const typeName = typeAssignment.getInitializer()?.getText();
            if (typeName) {
              fields.push({ name: assignment.getName(), type: typeName });
            }
          }
        }
      }
    });

    const templateData = { modelName: modelName, fields: fields };
    const templatesFolderPath = path.join(__dirname, "templates");

    const serviceTemplate = fs_1.readFileSync(
      path.join(templatesFolderPath, "serviceTemplate.ejs"),
      "utf-8"
    );
    const controllerTemplate = fs_1.readFileSync(
      path.join(templatesFolderPath, "controllerTemplate.ejs"),
      "utf-8"
    );
    const interfaceTemplate = fs_1.readFileSync(
      path.join(templatesFolderPath, "interfaceTemplate.ejs"),
      "utf-8"
    );
    const dtoTemplate = fs_1.readFileSync(
      path.join(templatesFolderPath, "dtoTemplate.ejs"),
      "utf-8"
    );
    const routeTemplate = fs_1.readFileSync(
      path.join(templatesFolderPath, "routeTemplate.ejs"),
      "utf-8"
    );

    const serviceContent = ejs_1.render(serviceTemplate, templateData);
    const controllerContent = ejs_1.render(controllerTemplate, templateData);
    const interfaceContent = ejs_1.render(interfaceTemplate, templateData);
    const dtoContent = ejs_1.render(dtoTemplate, templateData);
    const routeContent = ejs_1.render(routeTemplate, templateData);

    const outputFolderPath = path.join(__dirname, "src");

    ensureDirectoryExistence(path.join(outputFolderPath, "services"));
    ensureDirectoryExistence(path.join(outputFolderPath, "controllers"));
    ensureDirectoryExistence(path.join(outputFolderPath, "interfaces"));
    ensureDirectoryExistence(path.join(outputFolderPath, "dtos"));
    ensureDirectoryExistence(path.join(outputFolderPath, "routes"));

    fs_1.writeFileSync(
      path.join(outputFolderPath, "services", `${modelName.toLowerCase()}.service.ts`),
      serviceContent
    );
    fs_1.writeFileSync(
      path.join(outputFolderPath, "controllers", `${modelName.toLowerCase()}.controller.ts`),
      controllerContent
    );
    fs_1.writeFileSync(
      path.join(outputFolderPath, "interfaces", `${modelName.toLowerCase()}.interface.ts`),
      interfaceContent
    );
    fs_1.writeFileSync(
      path.join(outputFolderPath, "dtos", `${modelName.toLowerCase()}.dto.ts`),
      dtoContent
    );
    fs_1.writeFileSync(
      path.join(outputFolderPath, "routes", `${modelName.toLowerCase()}.route.ts`),
      routeContent
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { generateFiles };

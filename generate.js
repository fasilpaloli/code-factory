"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ejs = require("ejs");
const ts_morph = require("ts-morph");
const path = require("path");

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  try {
    fs.mkdirSync(dirname);
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

function generateFiles(modelName) {
  try {
    const project = new ts_morph.Project();
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
      ts_morph.SyntaxKind.NewExpression
    );
    const schemaObjectLiteral = schemaInitializer.getArguments()[0].asKindOrThrow(
      ts_morph.SyntaxKind.ObjectLiteralExpression
    );

    schemaObjectLiteral.forEachDescendant((descendant) => {
      if (descendant.getKind() === ts_morph.SyntaxKind.PropertyAssignment) {
        const assignment = descendant;
        const initializer = assignment.getInitializerIfKind(
          ts_morph.SyntaxKind.ObjectLiteralExpression
        );
        if (initializer) {
          const typeProperty = initializer.getProperty("type");
          if (typeProperty && typeProperty.getKind() === ts_morph.SyntaxKind.PropertyAssignment) {
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

    const serviceTemplate = fs.readFileSync(
      path.join(templatesFolderPath, "serviceTemplate.ejs"),
      "utf-8"
    );
    const controllerTemplate = fs.readFileSync(
      path.join(templatesFolderPath, "controllerTemplate.ejs"),
      "utf-8"
    );
    const interfaceTemplate = fs.readFileSync(
      path.join(templatesFolderPath, "interfaceTemplate.ejs"),
      "utf-8"
    );
    const dtoTemplate = fs.readFileSync(
      path.join(templatesFolderPath, "dtoTemplate.ejs"),
      "utf-8"
    );
    const routeTemplate = fs.readFileSync(
      path.join(templatesFolderPath, "routeTemplate.ejs"),
      "utf-8"
    );

    const serviceContent = ejs.render(serviceTemplate, templateData);
    const controllerContent = ejs.render(controllerTemplate, templateData);
    const interfaceContent = ejs.render(interfaceTemplate, templateData);
    const dtoContent = ejs.render(dtoTemplate, templateData);
    const routeContent = ejs.render(routeTemplate, templateData);

    var servicePath = "./src/services/".concat(modelName.toLowerCase(), ".service.ts");
    var controllerPath = "./src/controllers/".concat(modelName.toLowerCase(), ".controller.ts");
    var interfacePath = "./src/interfaces/".concat(modelName.toLowerCase(), ".interface.ts");
    var dtoPath = "./src/dtos/".concat(modelName.toLowerCase(), ".dto.ts");
    var routePath = "./src/routes/".concat(modelName.toLowerCase(), ".route.ts");

    ensureDirectoryExistence(servicePath);
    ensureDirectoryExistence(controllerPath);
    ensureDirectoryExistence(interfacePath);
    ensureDirectoryExistence(dtoPath);
    ensureDirectoryExistence(routePath);

    fs.writeFileSync(servicePath, serviceContent);
    fs.writeFileSync(controllerPath, controllerContent);
    fs.writeFileSync(interfacePath, interfaceContent);
    fs.writeFileSync(dtoPath, dtoContent);
    fs.writeFileSync(routePath, routeContent);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { generateFiles };

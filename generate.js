"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var ejs_1 = require("ejs");
var ts_morph_1 = require("ts-morph");
var path = require("path");

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs_1.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs_1.mkdirSync(dirname);
}

function generateFiles(modelName) {
    try {
        var project = new ts_morph_1.Project();
        var sourceFile;
        try {
            sourceFile = project.addSourceFileAtPath("./src/models/".concat(modelName.toLowerCase(), ".model.ts"));
        } catch (error) {
            throw new Error('The model file could not be found. Please ensure the file path is correct.');
        }

        // Define fields array here
        var fields = [];

        // Get the "Schema" object
        var schemaDeclaration = sourceFile.getVariableDeclarationOrThrow("".concat(modelName.toLowerCase(), "Schema"));


        // Rest of the operations...

        var templateData = { modelName: modelName, fields: fields };
        var serviceTemplate, controllerTemplate, interfaceTemplate, dtoTemplate, routeTemplate;
        try {
            serviceTemplate = fs_1.readFileSync('./templates/serviceTemplate.ejs', 'utf-8');
            controllerTemplate = fs_1.readFileSync('./templates/controllerTemplate.ejs', 'utf-8');
            interfaceTemplate = fs_1.readFileSync('./templates/interfaceTemplate.ejs', 'utf-8');
            dtoTemplate = fs_1.readFileSync('./templates/dtoTemplate.ejs', 'utf-8');
            routeTemplate = fs_1.readFileSync('./templates/routeTemplate.ejs', 'utf-8');
        } catch (error) {
            throw new Error('Failed to read template files. Ensure the file paths are correct and you have the necessary permissions.');
        }

        var serviceContent, controllerContent, interfaceContent, dtoContent, routeContent;
        try {
            serviceContent = ejs_1.render(serviceTemplate, templateData);
            controllerContent = ejs_1.render(controllerTemplate, templateData);
            interfaceContent = ejs_1.render(interfaceTemplate, templateData);
            dtoContent = ejs_1.render(dtoTemplate, templateData);
            routeContent = ejs_1.render(routeTemplate, templateData);
        } catch (error) {
            throw new Error('Failed to render templates. Check your template files for errors.');
        }

        try {
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

            fs_1.writeFileSync(servicePath, serviceContent);
            fs_1.writeFileSync(controllerPath, controllerContent);
            fs_1.writeFileSync(interfacePath, interfaceContent);
            fs_1.writeFileSync(dtoPath, dtoContent);
            fs_1.writeFileSync(routePath, routeContent);
        } catch (error) {
            throw new Error('Failed to write the output files. Ensure you have the necessary permissions and the output directory exists.');
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = { generateFiles };

// if (process.argv.length > 2) {
//     generateFiles(process.argv[2]);
// } else {
//     console.error('Please provide a model name as a command line argument.');
//     process.exit(1);
// }

import fs from 'fs';
import ejs from 'ejs';
import { Project, SyntaxKind, PropertyAssignment, Node } from 'ts-morph';

interface Field {
    name: string;
    type: string;
}

function generateFiles(modelName: string) {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(`./src/models/${modelName.toLowerCase()}.model.ts`);

    // Get the "Schema" object
    const schemaDeclaration = sourceFile.getVariableDeclarationOrThrow(`${modelName.toLowerCase()}Schema`);

    // Get the initializer of the "Schema" object, which should be a "NewExpression" (a call to "new Schema")
    const schemaInitializer = schemaDeclaration.getInitializerIfKindOrThrow(SyntaxKind.NewExpression);

    // The first argument of the "Schema" constructor is an "ObjectLiteralExpression"
    const schemaObjectLiteral = schemaInitializer.getArguments()[0].asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

    // Each property of the "ObjectLiteralExpression" corresponds to a field in the schema
    const fields: Field[] = [];
    schemaObjectLiteral.forEachDescendant((descendant: Node) => {
        if (descendant.getKind() === SyntaxKind.PropertyAssignment) {
            const assignment = descendant as PropertyAssignment;
            const initializer = assignment.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
            if (initializer) {
                const typeProperty = initializer.getProperty('type');
                if (typeProperty && typeProperty.getKind() === SyntaxKind.PropertyAssignment) {
                    const typeAssignment = typeProperty as PropertyAssignment;
                    const typeName = typeAssignment.getInitializer()?.getText();
                    if (typeName) {
                        fields.push({ name: assignment.getName(), type: typeName });
                    }
                }
            }
        }
    });

    const templateData = { modelName, fields };

    // Read your templates
    const serviceTemplate = fs.readFileSync('./src/templates/serviceTemplate.ejs', 'utf-8');
    const controllerTemplate = fs.readFileSync('./src/templates/controllerTemplate.ejs', 'utf-8');
    const interfaceTemplate = fs.readFileSync('./src/templates/interfaceTemplate.ejs', 'utf-8');
    const dtoTemplate = fs.readFileSync('./src/templates/dtoTemplate.ejs', 'utf-8');
    const routeTemplate = fs.readFileSync('./src/templates/routeTemplate.ejs', 'utf-8');

    // Render the templates
    const serviceContent = ejs.render(serviceTemplate, templateData);
    const controllerContent = ejs.render(controllerTemplate, templateData);
    const interfaceContent = ejs.render(interfaceTemplate, templateData);
    const dtoContent = ejs.render(dtoTemplate, templateData);
    const routeContent = ejs.render(routeTemplate, templateData);

    // Write the results to new files
    fs.writeFileSync(`./src/services/${modelName.toLowerCase()}.service.ts`, serviceContent);
    fs.writeFileSync(`./src/controllers/${modelName.toLowerCase()}.controller.ts`, controllerContent);
    fs.writeFileSync(`./src/interfaces/${modelName.toLowerCase()}.interface.ts`, interfaceContent);
    fs.writeFileSync(`./src/dtos/${modelName.toLowerCase()}.dto.ts`, dtoContent);
    fs.writeFileSync(`./src/routes/${modelName.toLowerCase()}.route.ts`, routeContent);
}

// Use the function for your model
generateFiles('Test');

# code-factory-osperb

[![npm version](https://badge.fury.io/js/code-factory-osperb.svg)](https://badge.fury.io/js/code-factory-osperb)

code-factory-osperb is a powerful npm package that provides a one-stop solution for auto-generating scripts for CRUD operations and associated files in Node.js applications. With code-factory-osperb, you can save time and effort by automating the creation of service files, controller files, interface files, DTO files, and route files based on your defined model.

## Features

- Automated generation of CRUD scripts for Node.js applications
- Supports TypeScript and JavaScript
- Flexible and customizable templates for generated files
- Easy-to-use command-line interface

## Installation

You can install code-factory-osperb globally using npm:

```bash
npm install -g code-factory-osperb

```

Usage
To generate the CRUD scripts and associated files for a model, simply run the following command:

```bash
code-factory-osperb <model-name>
```

Replace <model-name> with the name of your model. 

eg:  
```bash
code-factory-osperb User
```

This will generate the necessary files in the appropriate directories of your project.

Template Customization
code-factory-osperb allows you to customize the templates used for generating the files. By default, it includes the following templates:

controllerTemplate.ejs
dtoTemplate.ejs
interfaceTemplate.ejs
routeTemplate.ejs
serviceTemplate.ejs

You can modify these templates or create your own templates based on your requirements. Make sure to keep the placeholders <%= modelName %> and <% fields.forEach(...) %> intact as they are used for dynamic content insertion.

License
This project is licensed under the MIT License.

Issues and Contributions
If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.

Pull requests are welcome! If you would like to contribute to this project, feel free to submit a pull request.

for more: www.osperb.com
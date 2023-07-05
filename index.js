const generateFiles = require('./generate').generateFiles;

if (process.argv.length > 2) {
  generateFiles(process.argv[2]);
} else {
  console.error('Please provide a model name as a command line argument.');
  process.exit(1);
}
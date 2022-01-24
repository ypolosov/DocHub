const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const parser = require('./parser');

const sourceFileName = path.resolve(process.env.INIT_CWD, process.argv[2]);
const distanationFileName = path.resolve(process.env.INIT_CWD, 'manifest.yaml');

// eslint-disable-next-line no-console
console.log('Import file: ', sourceFileName);

fs.readFile(sourceFileName, 'utf8' , (err, yaml) => {
    if (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        return
    }

    fs.writeFileSync(distanationFileName, YAML.stringify(parser.parse(YAML.parse(yaml))));
})

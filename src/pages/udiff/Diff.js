
import yaml from 'js-yaml';

export class Diff {

    difference(originalYAML, modifiedYAML) {
        const a = yaml.load(originalYAML);
        const b = yaml.load(modifiedYAML);
    }

}
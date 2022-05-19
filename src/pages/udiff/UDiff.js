
import yaml from 'js-yaml';

export class Diff {

    difference(originalYAML, modifiedYAML) {
        const a = UnityYAML.parse(originalYAML);
        console.log(a);
        //const a = yaml.load(originalYAML);
        //const b = yaml.load(modifiedYAML);
    }

}

const UnityYAML = {
    /**
     * 
     * @param {string} assetContents 
     * @returns     
     */
    parse(assetContents) {
        const elements = [];

        // Search for blocks of --- !u!
        const expr = /--- !u!(\d+) &(\d*)/gm;
        const yamls = assetContents.split(expr);
        console.log(yamls);
        return elements;
    }
}
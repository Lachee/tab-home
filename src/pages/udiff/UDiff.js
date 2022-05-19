import { Parser } from "./Unity";

export class Diff {

    difference(originalYAML, modifiedYAML) {
        const a = Parser.parseScene(originalYAML);
        //const a = yaml.load(originalYAML);
        //const b = yaml.load(modifiedYAML);
    }

}


import yaml from 'js-yaml';


class Scene {
    gameObjects = {};
    components = {};

    /**
     * 
     * @param {Component} component 
     */
    addComponent(component) {
        this.components[component.ID] = component;
        if (component.m.GameObject) {
            if (this.gameObjects[component.m.GameObject.fileID]) {
                this.gameObjects[component.m.GameObject.fileID].components.push(component);
            } else {
                console.warn('GameObject for component doesnt exist yet');
            }
        }
        
    }

    addGameObject(gameObject) {
        this.gameObjects[gameObject.ID] = gameObject;
    }

}

export class BaseObject { 
    ID;

    properties = {};

    constructor(props, guid = null) {
        for(let k in props) {
            if (k.startsWith('m_')) 
                this[k] = props[k];
            else
                this.properties[k] = props[k];
        }

        if (guid) 
            this.ID = guid;
    }
}

export class Component extends BaseObject {
    ID;
    gameObject;

    constructor(props, guid = null) {
        super(props, guid);
    }
}

export class Transform extends Component {
    /** @type {Transform} parent */
    parent;

    /** @type {Transform[]} children */
    children = [];

    /**
     * Adds a child to the transform
     * @param {Transform} child 
     */
    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }
}
export class RectTransform extends Transform {}

export class MonoBehaviour extends Component {    
}



export class GameObject extends BaseObject {
    ID;

    /** @type {Transform} */
    transform;

    /** @type {Component[]} */
    components = {};

    addComponent(component) {
        if (component.gameObject) {
            component.gameObject = this;
        }

        const type = component.constructor.name;
        if (type === 'Transform' || type === 'RectTransform') {
            this.transform = component;
        } else {
            this.components[component.ID] = component;
        }
    }

}


const TypeMap = {
    'GameObject': GameObject,
    'Transform': Transform,
    'RectTransform': RectTransform,
    'MonoBehaviour': MonoBehaviour,

}

export const Parser = {
    /**
     * Parses the unity YAML
     * @param {string} assetContents raw Unity YAML 
     * @returns array of components
     */
    parse(assetContents, forEach = null) {
        const elements = {};

        // Search for blocks of --- !u!
        const expr = /^--- !u!(\d+) &(\d*)( \w*)?/gm;
        const blocks = assetContents.split(expr);
        
        // Pull the blocks and parse them
        for (let i = 1; i < blocks.length; i += 4) {
            const tag = blocks[i];
            const id = blocks[i+1];
            const modifiers = blocks[i+2];
            const raw = blocks[i+3];

            elements[id] = yaml.load(raw);
            elements[id].type = Object.keys(elements[id])[0];
            elements[id].ID = id;
            elements[id].tag = tag;
            elements[id].modifiers = (modifiers || '').trim();

            if (forEach)
                forEach(elements[id], i);
        }
        
        return elements;
    },


    parseScene(assetContents) {
        const scene = new Scene();

        const gameObjects = {};
        const transforms = {};
        const objectComponents = [];
        const rootComponents = [];

        function createBaseObject(element) {
            if (TypeMap[element.type]) {
                const type = TypeMap[element.type];
                const obj = new type(element[element.type], element.ID);
                return obj;
            }

            if (element.m_GameObject) 
                return new Component(element[element.type], element.ID);
            
            return new BaseObject(element[element.type], element.ID);
        }

        // Parse all the iitems
        this.parse(assetContents, (element) => {
            const object = createBaseObject(element);
            if (element.type === 'GameObject') {
                gameObjects[element.ID] = object;
            } else if (object.m_GameObject) {
                objectComponents.push(object);
            } else {
                rootComponents.push(object);
            }

            // Add to the transform lists
            if (element.type === 'RectTransform' || element.type === 'Transform')
                transforms[element.ID] = object;
        });

        // Add all the components
        for(const component of objectComponents) {
            const go = gameObjects[component.m_GameObject.fileID];
            if (go === undefined) {
                console.warn('Component does not have a game object!', component.ID, component.m_GameObject);
                continue;
            }
            go.addComponent(component);
        }


        // Fix all the children
        const rootGameObjects = {};
        for(const gameObjectID in gameObjects) {
            const gameObject = gameObjects[gameObjectID];
            if (!gameObject.transform) {
                console.error("Game Object does not have a Transform!", gameObjectID, gameObject);
                continue;
            }

            const parentID = gameObject.transform.m_Father.fileID;
            if (parentID === 0) {
                rootGameObjects[gameObject.ID] = gameObject;
            } else {
                if (transforms[parentID] !== undefined) {
                    transforms[parentID].addChild(gameObject.transform);
                } else {
                    console.warn('undefined parent', gameObject.transform.ID, parentID);
                }
            } 
        }

        console.log(rootGameObjects);
    },
}

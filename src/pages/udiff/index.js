import React from "react";
import { Diff } from "./UDiff";

export const UDiffPage = () => {
    return (
        <div className="udiff">
            <UDiffComponent></UDiffComponent>
        </div>
    );
};

export class UDiffComponent extends React.Component {

    originalText;
    modifiedText;

    attemptDiff = async (original, modified) => {
        console.log('Attempt Diff', original, modified);
        //if (!original) return false;
        //if (!modified) return false;
        //if (modified === original) return false;

        const diff = new Diff();
        diff.difference(original, modified);
        return true;
    }

    onFileChanged = async (event) => {
        event.preventDefault()
        const reader = new FileReader()

        // Wait for the value
        const value = await new Promise((resolve, reject) => {
            // Setup the load event
            reader.onload = async (e) => {
                resolve(e.target.result);
            };

            // Begin the read
            reader.readAsText(event.target.files[0]);            
        });

        switch (event.target.name) {
            default: break;
            case 'original':
                this.originalText = value;
                break;
            case 'modified':
                this.modifiedText = value;
                break;
        }
        await this.attemptDiff(this.originalText, this.modifiedText);
    }

    render() {
        return (
            <div>
  

                <label>Original</label>
                <input type="file" name="original" onChange={(e) => this.onFileChanged(e)} />

                <label>Modified</label>
                <input type="file" name="modified" onChange={(e) => this.onFileChanged(e)} />

                <button onClick={(e) => this.attemptDiff(this.originalText, this.modifiedText)}>Attempt</button>
            </div >
        );
    }
}
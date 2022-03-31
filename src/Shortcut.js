import React from 'react';

/**
 * @property {String} link the link to the webpage
 */
export class Shortcut extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            image: props.link + '/favicon.ico'
        }

    }

    render() {
        return (
            <div className="shopping-list">
                <img src={this.state.image}></img>
            </div>
        );
    }
}
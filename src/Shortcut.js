import React from 'react';
import { Favicon } from './Favicon';
import './Shortcut.scss';

export class ShortcutList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            links: props.links
        }
    }

    /** Exports the stored shortcuts to a string */
    export() {
        return JSON.stringify(this.state.links);
    }

    /** Imports the data  */
    import(data) {
        const json = JSON.parse(data);
        this.setState({ links: json });
    }

    add(link) {
        const links = this.state.links;
        links.push(link);
        this.setState({ links: links });
    }

    remove(link) {
        const links = this.state.links;
        const index = links.indexOf(link);
        if (index >= 0) {
            links.splice(index, 1);
            this.setState({ links: links });
            console.log('removed ', link, this.state.links);
        }
    }

    // Test Button to remove elemenets
    // handleRemove = (e) => {
    //     console.log('Removing URL', e.target.value);
    //     this.remove(e.target.value);
    // }

    render() {
        return (
            <ul className='Shortcut-List'>
                {this.state.links.map((item, index) => (
                    <li key={index}>
                        <Shortcut link={item}></Shortcut>
                    </li>
                ))}
            </ul>
        );
    }
}


/**
 * @property {String} link the link to the webpage
 */
export class Shortcut extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <a className="Shortcut" href={this.props.link}>
                <Favicon site={this.props.link}></Favicon>
            </a>
        );
    }
}
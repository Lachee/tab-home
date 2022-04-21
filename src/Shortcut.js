import React from 'react';
import './Shortcut.scss';

export class ShortcutList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            links: props.links
        }
    }

    add(link) {
        const links = this.state.links;
        links.push(link);
        this.setState({links: links});
    }

    remove(link) {
        const links = this.state.links;
        const index = links.indexOf(link);
        if (index >= 0) {
            links.splice(index, 1);
            this.setState({links: links});
            console.log('removed ', link, this.state.links);
        }
    }

    handleRemove = (e) => {
        console.log('Removing URL', e.target.value);
        this.remove(e.target.value);
    }

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
    
    defaultImage = 'logo512.png'; 

    constructor(props) {
        super(props);

        this.defaultImage = props.defaultImage || this.defaultImage;
        this.state = {
            image: props.link + '/favicon.ico'
        }
    }

    handleImageError = (e) => {
        e.target.src = this.defaultImage;
    }

    render() {
        return (
            <a className="Shortcut" href={this.props.link}>
                <img src={this.state.image} onError={this.handleImageError}></img>
            </a>
        );
    }
}
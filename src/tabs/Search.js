import React from "react";
import { Button, Form } from 'react-bulma-components';
import { Favicon } from "../utils/Favicon";

import './Search.scss';

export class Search extends React.Component {

    engines = {};

    constructor(props) {
        super(props);

        this.engines = props.engines || {
            "ddg": { search: "https://duckduckgo.com/?q={query}", name: 'Duck Duck Go'},
            "google": { search: "https://google.com.au/search?q={query}", name: 'Google' },
            "bing": { search: "https://bing.com/search?q={query}", name: 'Bing' }
        };

        this.state = Object.assign(
            { query: '' }, 
            this._prepareEngineState(this.props.engine || 'ddg')
        );

        window.search = this;
    }

    _prepareEngineState(engine) {
        const properties = this.engines[engine];
        if (!properties) 
            throw new Error('Cannot set engine to ' + engine + ' because it is not defined');
        

        return {
            engineKey:  engine,
            engine:     properties
        }
    }


    setEngine(engine) {
        console.log('Setting engine to ', engine);
        this.setState(this._prepareEngineState(engine));
    }

    handleQueryChange = (event) => {
        this.setState({query: event.target.value});
    }

    
    handleQueryKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSubmitClick(event);
        }
    }

    handleSubmitClick = (event) => {
        let url = this.state.engine.search.replace("{query}", encodeURIComponent(this.state.query));
        window.location = url;
    }

    handleFaviconClick = (event) => {
        const keys = Object.keys(this.engines);
        let index = keys.indexOf(this.state.engineKey);
        index = (index + 1) % keys.length;
        this.setEngine(keys[index]);
    }

    render() {
        return (
            <div className={`search field has-addons has-addons-fullwidth ${this.props.className}`}>
            <Button className="fake-button" onClick={this.handleFaviconClick}></Button>
                <Form.Control className="has-icons-left">
                    <Form.Input placeholder={`Search with ${this.state.engine.name}...`} value={this.state.query} onChange={this.handleQueryChange} onKeyPress={this.handleQueryKeyPress} autoFocus={this.props.autoFocus}></Form.Input>
                    <div  onClick={this.handleFaviconClick} className="icon is-small is-left">
                        <Favicon alt={this.state.engine.name} site={this.state.engine.search} ></Favicon>
                    </div>
                </Form.Control>
            </div>
        )
    }

}
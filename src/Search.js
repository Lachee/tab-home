import React from "react";
import { Button, Form } from 'react-bulma-components';

export class Search extends React.Component {

    engines = {};

    constructor(props) {
        super(props);

        this.engines = props.engines || {
            "ddg": { search: "https://duckduckgo.com/?q={query}" },
            "google": { search: "https://google.com.au/search?q={query}" },
            "bing": { search: "https://bing.com/search?q={query}" }
        };

        this.state = Object.assign({ query: '' }, this._prepareEngineState(this.props.engine || 'ddg'));
    }

    _prepareEngineState(engine) {
        const properties = this.engines[engine];
        if (!properties) 
            throw new Error('Cannot set engine to ' + engine + ' because it is not defined');
        

        return { 
            search: properties.search, 
            engine: engine 
        }
    }


    setEngine(engine) {
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
        let url = this.state.search.replace("{query}", encodeURIComponent(this.state.query));
        window.location = url;
    }

    render() {
        return (
            <div>
                <Form.Input value={this.state.query} onChange={this.handleQueryChange} onKeyPress={this.handleQueryKeyPress}></Form.Input>
                <Button onClick={this.handleSubmitClick}></Button>
            </div>
        )
    }

}
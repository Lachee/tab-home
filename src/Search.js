import React from "react";
import { Button, Form } from 'react-bulma-components';
import { Favicon } from "./Favicon";

export class Search extends React.Component {

    engines = {};

    constructor(props) {
        super(props);

        this.engines = props.engines || {
            "ddg": { search: "https://duckduckgo.com/?q={query}" },
            "google": { search: "https://google.com.au/search?q={query}" },
            "bing": { search: "https://bing.com/search?q={query}" }
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
            <div className="field has-addons">
                <Form.Control className="has-icons-left">
                    <Form.Input value={this.state.query} onChange={this.handleQueryChange} onKeyPress={this.handleQueryKeyPress}></Form.Input>
                    <span className="icon is-small is-left">
                        <Favicon site={this.state.search}></Favicon>
                    </span>
                </Form.Control>
                <Form.Control>
                    <Button color="primary" onClick={this.handleSubmitClick}>search</Button>
                </Form.Control>
            </div>
        )
    }

}
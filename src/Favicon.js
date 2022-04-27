import React from "react";

export class Favicon extends React.Component {
    
    defaultImage = 'logo512.png';
    url = '';


    constructor(props) {
        super(props);

        const absolute = props.absolute || 'https://tab.lu.je/';

        this.defaultImage = props.defaultImage || this.defaultImage;
        this.url = absolute + 'api/favicon?url=' + encodeURIComponent(this.props.site);
    }


    handleImageError = (e) => {
        e.target.src = this.defaultImage;
    }

    render() {
        return (
            <img className="favicon" src={this.url} data-src={this.url} onError={this.handleImageError}></img>
        )    
           
    }
}
import React from "react";

export class Favicon extends React.Component {
    
    defaultImage = 'logo512.png';
    url = '';


    constructor(props) {
        super(props);
        this.defaultImage = props.defaultImage || this.defaultImage;
    }


    handleImageError = (e) => {
        e.target.src = this.defaultImage;
    }

    render() {
        return (
            <img className="favicon" src={(this.props.absolute || 'https://tab.lu.je/')+'api/favicon?url=' + encodeURIComponent(this.props.site)} alt={this.props.alt || 'favicon'} onError={this.handleImageError}></img>
        )    
           
    }
}
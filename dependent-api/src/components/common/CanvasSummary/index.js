import React, { Component } from 'react';
import config from '../../../config/config';
import {  Link } from 'react-router-dom';


class CanvasSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {
        components: [],
        exposedAPIs: []
      };
  };

  getODAComponents() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ComponentsResource)
      .then((res) => res.json())
      .then((json) => {
        this.setState({ components: json.items })
      });
    }

  getExposedAPIs() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ExposedAPIsResource)
      .then((res) => res.json())
      .then((json) => {
        this.setState({ exposedAPIs: json.items })
      });
    }
  
  componentDidMount() {
    this.getODAComponents();
    this.getExposedAPIs();
  }

  render() {
    return (
      <div class="Component-body">
        There are {this.state.components.length} components exposing a total of {this.state.exposedAPIs.length} APIs in the ODA Canvas.
        Click <Link to="/components" style={{color: 'white'}}>components</Link> to see the list of components or <Link to="/dependencies" style={{color: 'white'}}>apis</Link> to manage any API dependencies.
      </div>
    );
  }
};

export default CanvasSummary;
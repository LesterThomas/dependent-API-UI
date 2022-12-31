
import React, { Component } from 'react';
import config from '../../../config/config';
import RAGStatus from '../RAGStatus';
import styled from 'styled-components';


// example K8s GET request to get deployments for a component:
// https://rke.tmforum.org/k8s/clusters/c-7rxjk/apis/apps/v1/namespaces/components/deployments?labelSelector=oda.tmforum.org%2FcomponentName%3Dr4-productinventory&limit=500
// example K8s GET request to get services for a component:
// https://rke.tmforum.org/k8s/clusters/c-7rxjk/api/v1/namespaces/components/services?labelSelector=oda.tmforum.org%2FcomponentName%3Dr4-productinventory&limit=500
// example K8s GET request to get StateFulSets for a component:
// https://rke.tmforum.org/k8s/clusters/c-7rxjk/apis/apps/v1/namespaces/components/statefulsets?labelSelector=oda.tmforum.org%2FcomponentName%3Dr4-productinventory&limit=500


// create styled components for the table below
const CompTable = styled.table`
  border: 0px solid white;
  border-spacing: 0px;
  display: inline-table;
  width: 30%;
  margin: 10px;
  font-size: 13px;
`;
const CompTD = styled.td`
  border: 1px solid white;
  padding: 5px;
`;
const CompTH = styled.th`
  border: 1px solid white;
  padding: 5px;
`;
const CompTR = styled.tr`
  border: 1px solid white;
`;



export class ODAComponents extends Component {

  constructor(props) {
    super(props);
    this.state = {components: [] };
      console.log('in constructor');
      console.log(this.state);
  };

  getODAComponents() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ComponentsResource)
      .then((res) => res.json())
      .then((json) => {
        console.log('in getODAComponents');
        console.log(json);
        this.setState({ components: json.items })
      });
    }

  componentDidMount() {
    this.getODAComponents();
  }

  getRAG(inDeploymentStatus){
    var ragColor = "amber"
    if (inDeploymentStatus === 'Complete') {
      ragColor = "green"
    }
    return ragColor
  }

  render() {
    return (
      <div class="Component-body">
        <p>Components in the current cluster</p>
        {this.state.components.map(component => (
          <CompTable>
            <thead>
              <CompTR>
                <CompTH colSpan="2">{component.metadata.name}</CompTH>
              </CompTR>
            </thead>
            <tbody>
            <CompTR>
                <CompTD>Deployment Status:</CompTD>
                <CompTD><RAGStatus state={this.getRAG(component.status['summary/status'].deployment_status)} /> &nbsp; {component.status['summary/status'].deployment_status}</CompTD>
              </CompTR>
              <CompTR>
                <CompTD>Type:</CompTD>
                <CompTD>{component.spec.type}</CompTD>
              </CompTR>
              <CompTR>
                <CompTD>Maintainers:</CompTD>
                <CompTD>
                  {component.spec.maintainers.map(maintainer => (
                    <span>{maintainer.name} ({maintainer.email})</span>
                  ))}
                </CompTD>
              </CompTR>                

              <CompTR>
                <CompTD>Exposed APIs:</CompTD>
                <CompTD>
                    {component.status.exposedAPIs.map(exposedAPI => (
                      <div>{exposedAPI.name} <span style={{color:"grey"}}> (core)</span></div>
                  ))}
                    <div>{component.status.securityAPIs.partyrole.name} <span style={{color:"grey"}}> (security)</span></div>
                    {component.status.managementAPIs.map(exposedAPI => (
                      <div>{exposedAPI.name} <span style={{color:"grey"}}> (management)</span></div>
                  ))}
                </CompTD>
              </CompTR>
              <CompTR>
                <CompTD>Dependent APIs:</CompTD>
                <CompTD>
                  <div></div>
                </CompTD>
              </CompTR>                
            </tbody>
          </CompTable>
          ))}            
      </div>
    );
  }
};

export class ODAComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {metadata: { name: props.name}};
  };

  getODAComponent() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ComponentsResource + this.state.metadata.name)
      .then((res) => res.json())
      .then((json) => {
        console.log('in getODAComponents');
        console.log(json);
        this.setState(json)
      });
    }

  componentDidMount() {
    this.getODAComponent();
  }

  getRAG(inDeploymentStatus){
    var ragColor = "amber"
    if (inDeploymentStatus === 'Complete') {
      ragColor = "green"
    }
    return ragColor
  }

  render() {
    return (
      <div class="Component-body">
        <p>{this.state.metadata.name}</p>
        {('status' in this.state) && <p> {this.state.status['summary/status'].deployment_status} </p>}
                  
      </div>
    );
  }
};


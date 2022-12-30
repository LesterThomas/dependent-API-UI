
import React, { Component } from 'react';
import config from '../../../config/config';
import styled from 'styled-components';

const ComponentsTable = styled.table`
  border: 0px solid white;
  border-spacing: 0px;
  display: inline-table;
  width: 30%;
  margin: 10px;
  font-size: 13px;
`;
const ComponentsTD = styled.td`
  border: 1px solid white;
  padding: 5px;
`;
const ComponentsTH = styled.th`
  border: 1px solid white;
  padding: 5px;
`;
const ComponentsTR = styled.tr`
  border: 1px solid white;
`;

class ODAComponents extends Component {

  constructor(props) {
    super(props);
    this.state = {components: [] };
      console.log('in constructor');
      console.log(this.state);
  };

  getODAComponents() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.k8sAPIVersion + 'components')
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

  render() {
    console.log('in render');
    console.log(this.state);
    return (
  
      <div>
        <header>
          <p>Components in the current cluster</p>
          {this.state.components.map(component => (
            <ComponentsTable>
              <thead>
                <ComponentsTR>
                  <ComponentsTH colSpan="2">{component.metadata.name}</ComponentsTH>
                </ComponentsTR>
              </thead>
              <tbody>
              <ComponentsTR>
                  <ComponentsTD>Deployment Status:</ComponentsTD>
                  <ComponentsTD>{component.status['summary/status'].deployment_status}</ComponentsTD>
                </ComponentsTR>
                <ComponentsTR>
                  <ComponentsTD>Type:</ComponentsTD>
                  <ComponentsTD>{component.spec.type}</ComponentsTD>
                </ComponentsTR>
                <ComponentsTR>
                  <ComponentsTD>Maintainers:</ComponentsTD>
                  <ComponentsTD>
                    {component.spec.maintainers.map(maintainer => (
                      <span>{maintainer.name} ({maintainer.email})</span>
                    ))}
                  </ComponentsTD>
                </ComponentsTR>                

                <ComponentsTR>
                  <ComponentsTD>Exposed APIs:</ComponentsTD>
                  <ComponentsTD>
                      {component.status.exposedAPIs.map(exposedAPI => (
                        <div>{exposedAPI.name} <span style={{color:"grey"}}> (core)</span></div>
                    ))}
                      <div>{component.status.securityAPIs.partyrole.name} <span style={{color:"grey"}}> (security)</span></div>
                      {component.status.managementAPIs.map(exposedAPI => (
                        <div>{exposedAPI.name} <span style={{color:"grey"}}> (management)</span></div>
                    ))}
                  </ComponentsTD>
                </ComponentsTR>
                <ComponentsTR>
                  <ComponentsTD>Dependent APIs:</ComponentsTD>
                  <ComponentsTD>
                    <div></div>
                  </ComponentsTD>
                </ComponentsTR>                
              </tbody>
            </ComponentsTable>
            ))}            
        </header>
      </div>
    );
  }
};

export default ODAComponents;
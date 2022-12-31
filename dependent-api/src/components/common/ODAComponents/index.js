
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import config from '../../../config/config';
import RAGStatus from '../RAGStatus';
import styled from 'styled-components';

// create styled components for the table below
const CompTable = styled.table`
  border: 0px solid white;
  border-spacing: 0px;
  display: inline-table;
  width: 30%;
  margin: 10px;
  font-size: 13px;
`;
const CompTableWide = styled.table`
  border: 0px solid white;
  border-spacing: 0px;
  display: inline-table;
  width: 90%;
  margin: 10px;
  font-size: 13px;
`;
const CompTDLeft = styled.td`
  border: 1px solid white;
  padding: 5px;
  text-align: left;
`;
const CompTDRight = styled.td`
  border: 1px solid white;
  padding: 5px;
  text-align: right;
`;
const CompTH = styled.th`
  border: 1px solid white;
  padding: 5px;
`;
const CompTR = styled.tr`
  border: 1px solid white;
`;

function getRAG(inDeploymentStatus){
  var ragColor = "amber"
  if (inDeploymentStatus === 'Complete') {
    ragColor = "green"
  }
  return ragColor
}

function ComponentDetails(props) {
  var component = props.component
  return (
      
  <tbody> 
    <CompTR>
      <CompTDRight>Deployment Status:</CompTDRight>
      <CompTDLeft><RAGStatus state={getRAG(component.status['summary/status'].deployment_status)} /> &nbsp; {component.status['summary/status'].deployment_status}</CompTDLeft>
    </CompTR>
    <CompTR>
      <CompTDRight>Type:</CompTDRight>
      <CompTDLeft>{component.spec.type}</CompTDLeft>
    </CompTR>
    <CompTR>
      <CompTDRight>Maintainers:</CompTDRight>
      <CompTDLeft>
        {component.spec.maintainers.map(maintainer => (
          <span>{maintainer.name} ({maintainer.email})</span>
        ))}
      </CompTDLeft>
    </CompTR>                
    <CompTR>
      <CompTDRight>Exposed APIs:</CompTDRight>
      <CompTDLeft>
          {component.status.exposedAPIs.map(exposedAPI => (
            <div>{exposedAPI.name} <span style={{color:"grey"}}> (core)</span></div>
        ))}
          <div>{component.status.securityAPIs.partyrole.name} <span style={{color:"grey"}}> (security)</span></div>
          {component.status.managementAPIs.map(exposedAPI => (
            <div>{exposedAPI.name} <span style={{color:"grey"}}> (management)</span></div>
        ))}
      </CompTDLeft>
    </CompTR>
    <CompTR>
      <CompTDRight>Dependent APIs:</CompTDRight>
      <CompTDLeft>
        <div></div>
      </CompTDLeft>
    </CompTR>                  
  </tbody> 
  );}    


function ResourceDetails(props) {
  console.log('in ResourceDetails for ' + props.title)
  var resources = props.resources
  console.log(resources)

  return (
  <tbody>
    <CompTR>
      <CompTDRight>{props.title}:</CompTDRight>
      <CompTDLeft>
        {resources.map(resource => ( <div>{resource.metadata.name}</div> ))}
      </CompTDLeft>
    </CompTR>
  </tbody>
  );}


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



  render() {
    return (
      <div class="Component-body">
        <p>Components in the current cluster</p>
        {this.state.components.map(component => (
          <CompTable >
            <thead>
              <CompTR>
                <CompTH colSpan="2"><Link to={component.metadata.name} style={{color: 'white'}}>{component.metadata.name}</Link></CompTH>
              </CompTR>
            </thead>
            <ComponentDetails component={component} />
          </CompTable>
          ))}            
      </div>
    );
  }
};

export class ODAComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {component:{ metadata: { name: props.name}}};
  };

  getODAComponent() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ComponentsResource + this.state.component.metadata.name)
      .then((res) => res.json())
      .then((json) => {
        console.log('in getODAComponents');
        console.log(json);
        this.setState({component: json})
      });
    }

  getDeployments() {
    const queryAPIURL = config.k8sAPIBaseUrl + config.AppsAPI + 'namespaces/' + config.ComponentsNamespace + config.DeploymentsResource + config.LabelSelector + this.state.component.metadata.name
    console.log(queryAPIURL)
    fetch(queryAPIURL)
      .then((res) => res.json())
      .then((json) => {
          
        console.log('in getDeployments');
        console.log(json);
        this.setState({deployments: json.items})
      });
    }
    getResources(inAPI, inResource, inResourceName) {
      const queryAPIURL = config.k8sAPIBaseUrl + inAPI + 'namespaces/' + config.ComponentsNamespace + inResource + config.LabelSelector + this.state.component.metadata.name
      console.log(queryAPIURL)
      fetch(queryAPIURL)
        .then((res) => res.json())
        .then((json) => {
            
          console.log('in getResourcess for ' + inResourceName);
          console.log(json);
          var newState = {}
          newState[inResourceName] = json.items
          if (json.items.length > 0) {
            this.setState(newState)
          }
        });
      }
  
  
  componentDidMount() {
    this.getODAComponent();
    this.getResources(config.AppsAPI, config.DeploymentsResource, 'deployments');
    this.getResources(config.AppsAPI, config.StatefulSetsResource, 'statefulsets');
    this.getResources(config.CoreAPI, config.ServicesResource, 'services');
    this.getResources(config.BatchAPI, config.JobsResource, 'jobs');
    this.getResources(config.CronJobAPI, config.CronJobsResource, 'cronjobs');
    this.getResources(config.CoreAPI, config.PersistentVolumeClaimsResource, 'persistentvolumeclaims');
    this.getResources(config.CoreAPI, config.ConfigMapsResource, 'configmaps');
    this.getResources(config.CoreAPI, config.SecretsResource, 'secrets');
    this.getResources(config.CoreAPI, config.ServiceAccountsResource, 'serviceaccounts');
    this.getResources(config.RbacAPI, config.RoleResource, 'roles');
    this.getResources(config.RbacAPI, config.RoleBindingResource, 'rolebindings');
  }

  getRAG(inDeploymentStatus){
    var ragColor = "amber"
    if (inDeploymentStatus === 'Complete') {
      ragColor = "green"
    }
    return ragColor
  }

  render() {
    var component = this.state.component
    return (
      <div class="Component-body">

        <CompTableWide>
          <thead>
            <CompTR>
              <CompTH colSpan="2">{component.metadata.name}</CompTH>
            </CompTR>
          </thead>
          {('status' in this.state.component) && <ComponentDetails component={component} />}
          {('deployments' in this.state) && <ResourceDetails title="Deployments" resources={this.state.deployments}/>} 
          {('statefulsets' in this.state) && <ResourceDetails title="StatefulSets" resources={this.state.statefulsets}/>}
          {('services' in this.state) && <ResourceDetails title="Services" resources={this.state.services}/>}
          {('jobs' in this.state) && <ResourceDetails title="Jobs" resources={this.state.jobs}/>}
          {('cronjobs' in this.state) && <ResourceDetails title="CronJobs" resources={this.state.cronjobs}/>}
          {('persistentvolumeclaims' in this.state) && <ResourceDetails title="Persistent Volume Claims" resources={this.state.persistentvolumeclaims}/>}
          {('configmaps' in this.state) && <ResourceDetails title="Config Maps" resources={this.state.configmaps}/>}
          {('secrets' in this.state) && <ResourceDetails title="Secrets" resources={this.state.secrets}/>}
          {('serviceaccounts' in this.state) && <ResourceDetails title="Service Accounts" resources={this.state.serviceaccounts}/>}
          {('roles' in this.state) && <ResourceDetails title="Roles" resources={this.state.roles}/>}
          {('rolebindings' in this.state) && <ResourceDetails title="Role Bindings" resources={this.state.rolebindings}/>}

        </CompTableWide>
             
      </div>
    );
  }
};



import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import config from '../../../config/config';
import RAGStatus from '../RAGStatus';
import { CompTable, CompTableWide, CompTDLeft, CompTDRight, CompTH, CompTR } from '../StyledTable';
  
function getRAG(inDeploymentStatus){
  var ragColor = "amber"
  if (inDeploymentStatus === 'Complete') {
    ragColor = "green"
  }
  return ragColor
}

function getAPIRAG(inAPIStatus){
  var ragColor = "amber"
  if (inAPIStatus) {
    ragColor = "green"
  }
  return ragColor
}

function getResourceRAG(inTitle, inResource) {
  var ragColor = "grey"
  switch (inTitle) {

    case "Deployments":
      if (inResource.status.readyReplicas === inResource.status.replicas) { 
        ragColor = "green"
      } else {
        ragColor = "amber"
      }
      // if deployment is not progressing, set ragColor to red
      if (inResource.status.conditions) {
        if (inResource.status.conditions.length > 0) {
          for (var i = 0; i < inResource.status.conditions.length; i++) {
            if (inResource.status.conditions[i].type === 'Progressing') {
              if (inResource.status.conditions[i].status === 'False') {
                ragColor = "red"
              }
            }
          }
        }
      }
      break;

    case "Stateful Sets":
      if (inResource.status.readyReplicas === inResource.status.replicas) {
        ragColor = "green"
      } else {
        ragColor = "amber"
      }
      break;

    case "Services":
      // for services we need to check the endpoints that have been added to the service status
      if ('endpoints' in inResource.status) {
        ragColor = "amber"
        if (inResource.status.endpoints) {
          if (inResource.status.endpoints.length > 0) {
            for (var i = 0; i < inResource.status.endpoints.length; i++) {
              if (inResource.status.endpoints[i].addresses) {
                ragColor = "green"
              } 
            }
          }
        }
      }
      break;

    case "Persistent Volume Claims":
      if (inResource.status.phase === 'Bound') {
        ragColor = "green"
      } else {
        ragColor = "amber"
      }
      break;

    case "Jobs":
      if (inResource.status.succeeded === 1) {
        ragColor = "green"
      } else {
        ragColor = "amber"
      }
      break;

      default:
        break;
    }
  return ragColor
}

function ComponentDetails(props) {
  var component = props.component
  return (
      
  <tbody> 
    <CompTR>
      <CompTDRight>Deployment Status:</CompTDRight>
      <CompTDLeft><RAGStatus status={getRAG(component.status['summary/status'].deployment_status)} /> &nbsp; {component.status['summary/status'].deployment_status}</CompTDLeft>
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
            <div><RAGStatus size="10px" status={getAPIRAG(exposedAPI.ready)} /> &nbsp; <Link to={'/exposedapi/' + exposedAPI.name} style={{color: 'white'}}> {exposedAPI.name} </Link> <span style={{color:"grey"}}> (core)</span></div>
        ))}
        <div><RAGStatus size="10px" status={getAPIRAG(component.status.securityAPIs.partyrole.ready)} /> &nbsp; <Link to={'/exposedapi/' + component.status.securityAPIs.partyrole.name} style={{color: 'white'}}> {component.status.securityAPIs.partyrole.name} </Link> <span style={{color:"grey"}}> (security)</span></div>
        {component.status.managementAPIs.map(managementAPI => (
            <div><RAGStatus size="10px" status={getAPIRAG(managementAPI.ready)} /> &nbsp; <Link to={'/exposedapi/' + managementAPI.name} style={{color: 'white'}}> {managementAPI.name} </Link> <span style={{color:"grey"}}> (management)</span></div>
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
  var resources = props.resources
  
  // console.log('in ResourceDetails for ' + props.title)
  //  console.log(resources)
  

  return (
  <tbody>
    <CompTR>
      <CompTDRight>{props.title}:</CompTDRight>
      <CompTDLeft>
        {resources.map(resource => ( 
          <div><RAGStatus size="10px" status={getResourceRAG(props.title, resource)} /> &nbsp; {resource.metadata.name}</div>
        ))}
      </CompTDLeft>
    </CompTR>
  </tbody>
  );}

export class ODAComponents extends Component {

  constructor(props) {
    super(props);
    this.state = {components: [] };
    this.timeoutFunction = null;
  };

  getODAComponents() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ComponentsResource)
      .then((res) => res.json())
      .then((json) => {
        console.log('in getODAComponents');
        console.log(json);
        this.setState({ components: json.items })
      });
      
    this.timeoutFunction = setTimeout(() => { this.getODAComponents() }, 5000);
  }

  componentDidMount() {
    this.getODAComponents();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutFunction);
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
    this.timeoutFunction = null;
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
    const queryAPIURL = config.k8sAPIBaseUrl + config.AppsAPI + 'namespaces/' + config.ComponentsNamespace + config.DeploymentsResource + config.ComponentLabelSelector + this.state.component.metadata.name
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
      const queryAPIURL = config.k8sAPIBaseUrl + inAPI + 'namespaces/' + config.ComponentsNamespace + inResource + config.ComponentLabelSelector + this.state.component.metadata.name
      console.log(queryAPIURL)
      fetch(queryAPIURL)
        .then((res) => res.json())
        .then((json) => {
          // console.log('in getResourcess for ' + inResourceName);
          // console.log(json);
          var newState = {}
          newState[inResourceName] = json.items
          //if (json.items.length > 0) {
            this.setState(newState)
          //}
        });
      }
  
  refreshData() {
    this.getODAComponent();
    this.getResources(config.AppsAPI, config.DeploymentsResource, 'deployments');
    this.getResources(config.AppsAPI, config.StatefulSetsResource, 'statefulsets');
    this.getResources(config.CoreAPI, config.ServicesResource, 'services');
    this.getResources(config.CoreAPI, config.EndpointsResource, 'endpoints');
    this.getResources(config.BatchAPI, config.JobsResource, 'jobs');
    this.getResources(config.CronJobAPI, config.CronJobsResource, 'cronjobs');
    this.getResources(config.CoreAPI, config.PersistentVolumeClaimsResource, 'persistentvolumeclaims');
    this.getResources(config.CoreAPI, config.ConfigMapsResource, 'configmaps');
    this.getResources(config.CoreAPI, config.SecretsResource, 'secrets');
    this.getResources(config.CoreAPI, config.ServiceAccountsResource, 'serviceaccounts');
    this.getResources(config.RbacAPI, config.RoleResource, 'roles');
    this.getResources(config.RbacAPI, config.RoleBindingResource, 'rolebindings');  
    // refresh the data every 5 seconds if the deployment is not complete, otherwise every 30 seconds
    var interval = 5000
    if ('status' in this.state.component) {
      if (this.state.component.status['summary/status'].deployment_status === 'Complete') {
        interval = 30000
      }
    }
    this.timeoutFunction = setTimeout(() => { this.refreshData() }, interval);
  }

  componentDidMount() {
    this.refreshData();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutFunction);
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
    // add the endpoints data into the services status
    if ('services' in this.state) {
        this.state.services.forEach(service => {
          if ('endpoints' in this.state) {
            if (!('endpoints' in service.status)) {
            this.state.endpoints.forEach(endpoint => {
              if (service.metadata.name === endpoint.metadata.name) {
                console.log('Adding endpoints to ' + service.metadata.name)
                service.status.endpoints = endpoint.subsets
                console.log(service.status)
              }
            })
          }
        }
      })
    }


    return (
      <div class="Component-body">

        <CompTableWide>
          <thead>
            <CompTR>
              <CompTH colSpan="2">Component: {component.metadata.name}</CompTH>
            </CompTR>
          </thead>
          {('status' in this.state.component) && <ComponentDetails component={component} />}
          {('deployments' in this.state) && <ResourceDetails title="Deployments" resources={this.state.deployments}/>} 
          {('statefulsets' in this.state) && <ResourceDetails title="Stateful Sets" resources={this.state.statefulsets}/>}
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



import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import config from '../../../config/config';
import RAGStatus from '../RAGStatus';
import { CompTableWide, CompTDLeft, CompTDRight, CompTH, CompTR } from '../StyledTable';
import { Link } from 'react-router-dom';

function ResourceDetails(props) {
  var resource = props.resource
  return (
    <div><RAGStatus size="10px" status={getResourceRAG(props.title, resource)} /> &nbsp; {resource.metadata.name}</div>
  );}

  function getAPIRAG(inAPIStatusImplementation){
    var ragColor = "amber"
    if ((inAPIStatusImplementation) && (inAPIStatusImplementation.ready)) {
      ragColor = "green"
    }
    return ragColor
  }

function getResourceRAG(inTitle, inResource) {
  var ragColor = "grey"
  switch (inTitle) {

    case "Service":
      // for services we need to check the endpoints that have been added to the service status
      if ('Endpoints' in inResource.status) {
        ragColor = "amber"
        if (inResource.status.Endpoints) {
          if (inResource.status.Endpoints.length > 0) {
            for (var i = 0; i < inResource.status.Endpoints.length; i++) {
              if (inResource.status.Endpoints[i].addresses) {
                ragColor = "green"
              } 
            }
          }
        }
      }
      break;

      default:
        break;
    }
  return ragColor
}
export class ExposedAPIs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          name: 'Component Name',
          selector: row => row.componentName,
          sortable: true
        },       
        {
          name: 'Name',
          selector: row => row.name,
          sortable: true
        },
        {
          name: 'Cluster URL',
          selector: row => row.clusterUrl,
          sortable: true,
          wrap: true
        },        
        {
          name: 'Gateway URL',
          selector: row => row.gatewayUrl,
          sortable: true,
          grow: 3,
          wrap: true
        },
        {
          name: 'Ready',
          selector: row => <RAGStatus status={row.ready} />
        },
      ],
      data: []
      };
  };

  getExposedAPIs() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ExposedAPIsResource)
      .then((res) => res.json())
      .then((json) => {
        var apiList = json.items;
        var apiStateData = [];
        for (var i = 0; i < apiList.length; i++) {
          var ready = "amber"
          if ('implementation' in apiList[i].status)
            if (apiList[i].status.implementation.ready)
              ready = "green"
          
          var apiItem = {
            id: i,
            componentName: apiList[i].metadata.ownerReferences[0].name,
            name: apiList[i].metadata.name,
            clusterUrl: apiList[i].status.apiStatus.implementation + '.components.svc.cluster.local',
            gatewayUrl: apiList[i].status.apiStatus.url,
            ready: ready
          }
          apiStateData.push(apiItem);
        }
        this.setState({ data: apiStateData })
      });
    }

  componentDidMount() {
    this.getExposedAPIs();
  }

  render() {
    return (
  
      <div className="Component-body">
        <p>APIs exposed in the current cluster</p>
        <DataTable
            columns={this.state.columns}
            data={this.state.data}
            selectableRows
            highlightOnHover
            striped
            selectableRowsSingle
        />
      </div>
    );
  }
};

export class ExposedAPI extends Component {

  constructor(props) {
    super(props);
    this.state = {exposedAPI:{ metadata: { name: props.name}}};
    this.timeoutFunction = null;
  };

  getExposedAPI() {
    const queryAPIURL = config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ExposedAPIsResource + this.state.exposedAPI.metadata.name
    console.log(queryAPIURL)
    fetch(queryAPIURL)
      .then((res) => res.json())
      .then((json) => {
        json.metadata.name = this.state.exposedAPI.metadata.name;
        this.setState({exposedAPI: json})
      });
    }

  getResource(inAPI, inResource, inResourceName) {
    const queryAPIURL = config.k8sAPIBaseUrl + inAPI + 'namespaces/' + config.ComponentsNamespace + inResource + inResourceName
    console.log(queryAPIURL)
    fetch(queryAPIURL)
      .then((res) => res.json())
      .then((json) => {
          
        var newState = {}
        newState[json.kind] = json
        this.setState(newState)
        
      });
    }
  
  refreshData() {
    this.getExposedAPI();
    if ('spec' in this.state.exposedAPI) {
      this.getResource(config.CoreAPI, config.ServicesResource, this.state.exposedAPI.spec.implementation);
      this.getResource(config.CoreAPI, config.EndpointsResource, this.state.exposedAPI.spec.implementation);
    }

    /*
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
    */
    // refresh the data every 5 seconds if the deployment is not complete, otherwise every 30 seconds
    var interval = 5000
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
    var exposedAPI = this.state.exposedAPI
    // if the exposedAPI is not found then return a 404 message
    if ('code' in exposedAPI) {
      if (exposedAPI.code === 404) {
        return (
          <div className="Component-body">
            <p>{exposedAPI.message}</p>
          </div>
        )
      }
    }

    // add the endpoints data into the services status
    if ('Service' in this.state) {
      if ('Endpoints' in this.state) {
        if (!('Endpoints' in this.state.Service.status)) {
          if (this.state.Service.metadata.name === this.state.Endpoints.metadata.name) {
            var newService = this.state.Service
            newService.status.Endpoints = this.state.Endpoints.subsets
            this.setState({Service: newService})
          }
        }
      }
    }


    return (
      <div className="Component-body">

        <CompTableWide>
          <thead>
            <CompTR>
              <CompTH colSpan="2">ExposedAPI: {exposedAPI.metadata.name}</CompTH>
            </CompTR>
          </thead>
          <tbody> 
            <CompTR>
              <CompTDRight>Component Name:</CompTDRight>
              <CompTDLeft>{('labels' in exposedAPI.metadata) && (<Link to={'/components/' + exposedAPI.metadata.labels['oda.tmforum.org/componentName']} style={{color: 'white'}}> {exposedAPI.metadata.labels['oda.tmforum.org/componentName']} </Link>)}</CompTDLeft>
            </CompTR>
            <CompTR>
              <CompTDRight>Cluster URL:</CompTDRight>
              <CompTDLeft>{('status' in exposedAPI) && (<span> <RAGStatus size="10px" status={getAPIRAG(exposedAPI.status.implementation)} /> &nbsp; {exposedAPI.status.apiStatus.implementation + '.components.svc.cluster.local'} </span>)}</CompTDLeft>
            </CompTR>          
            <CompTR>
              <CompTDRight>Gateway URL:</CompTDRight>
              <CompTDLeft>{('status' in exposedAPI) && (exposedAPI.status.apiStatus.url)}</CompTDLeft>
            </CompTR>          
            <CompTR>
              <CompTDRight>Service:</CompTDRight>
              <CompTDLeft>{('Service' in this.state) && ( <ResourceDetails title="Service" resource={this.state.Service}/> )}</CompTDLeft>
            </CompTR>          
          </tbody>
        </CompTableWide>
      </div>
    );
  }
};

/*
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

*/
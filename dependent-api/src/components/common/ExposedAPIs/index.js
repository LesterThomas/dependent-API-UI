/** 
 * 2 Classes to display a list of ExposedAPIs and a single ExposedAPI respectively
*/

import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import config from '../../../config/config';
import RAGStatus from '../RAGStatus';
import { CompTableWide, CompTDLeft, CompTDRight, CompTH, CompTR } from '../StyledTable';
import { Link } from 'react-router-dom';

function ResourceDetails(props) {
  /**
   * This helper component displays a single resource. The exact behaviour depends on the resource type.
   */
  var resource = props.resource
  return (
    <div><RAGStatus size="10px" status={getResourceRAG(props.title, resource)} /> &nbsp; {resource.metadata.name}</div>
  );}

function ResourcesDetails(props) {
  /**
   * This helper component displays a list of resources. The exact behaviour depends on the resource type.
   */
  var resources = props.resources
  return (
    <div>
      {resources.map(resource => (
        <div><RAGStatus size="10px" status={getResourceRAG(props.title, resource)} /> &nbsp; {resource.metadata.name}</div>
      ))}
    </div>      
  );}
  
function getAPIRAG(inAPIStatusImplementation){
  /**
   * This is a helper function that returns the RAG status of an API based on its implementation ready status. 
   */
  var ragColor = "amber"
  if ((inAPIStatusImplementation) && (inAPIStatusImplementation.ready)) {
    ragColor = "green"
  }
  return ragColor
}

function getResourceRAG(inTitle, inResource) {
  /**
   * This is a helper function that returns the RAG status of a resource. The exact behaviour depends on the resource type.
   */
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

    case "Pods":
      // for pods we need to check the status of the pod
      // a pod is ready if all its containers are ready
      if (inResource.status.containerStatuses) {
        ragColor = "amber"
        var allContainersReady = true
        for (var j = 0; j < inResource.status.containerStatuses.length; j++) {
          if (!inResource.status.containerStatuses[j].ready) {
            allContainersReady = false
            // if the state is waiting then make status red
            if (inResource.status.containerStatuses[j].state.waiting) {
              ragColor = "red"
            }
          }
        }
        if (allContainersReady) {
          ragColor = "green"
        }
      }
      break;

      default:
        break;
    }
  return ragColor
}
export class ExposedAPIs extends Component {
  /**
   * This class retrieves a list of exposed APIs and displays their metadata in a table.
   */

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
  /**
  * Retrieves a list of exposed APIs and stores the data in the component's state.
  * The data includes the API's component name, name, cluster URL, gateway URL, and status (ready or not ready).
  */
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
    /**
     * This function is called when the component is mounted.
     * It calls the getExposedAPIs function to retrieve the list of exposed APIs.
     */
    this.getExposedAPIs();
  }

  render() {
    /**
     * This function renders the component.
     * It returns a table containing the metadata for the exposed APIs.
     */
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
  /**
   * A class for displaying and managing data for an ExposedAPI.
   *
   * The class fetches data for an ExposedAPI, including its metadata, specification, and associated resources (such as services
   * and pods). The class also contains functions for refreshing the data and determining the RAG (red-amber-green) status of the
   * ExposedAPI.
   *
   * @prop {string} name - The name of the ExposedAPI to display.
   */

  constructor(props) {
    super(props);
    this.state = {exposedAPI:{ metadata: { name: props.name}}};
    this.timeoutFunction = null;
  };

  getExposedAPI() {
    /**
     * Fetches data for the ExposedAPI and updates the component state with the new data.
     *
     * The function constructs a URL using the ExposedAPI's name and the `config` object, and uses the `fetch` function to make a GET request to the URL. It then updates the component state with the data returned from the request.
     *
     * @param {string} config.k8sAPIBaseUrl - The base URL for the Kubernetes API.
     * @param {string} config.ODAAPI - The name of the ODA API group.
     * @param {string} config.ODAAPIVersion - The version of the ODA API.
     * @param {string} config.ComponentsNamespace - The namespace for the ExposedAPI.
     * @param {string} config.ExposedAPIsResource - The resource for ExposedAPIs.
     * @param {string} this.state.exposedAPI.metadata.name - The name of the ExposedAPI.
     * @param {string} config.CoreAPI - The name of the Kubernetes Core API group.
     * @param {string} config.ServicesResource - The resource for services.
     * @param {string} this.state.exposedAPI.spec.implementation - The service for the implementation of the ExposedAPI.
     * @param {string} config.EndpointsResource - The resource for endpoints (services create enspoints that detail the implementation for the service).
     */
    const queryAPIURL = config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ExposedAPIsResource + this.state.exposedAPI.metadata.name
    console.log(queryAPIURL)
    fetch(queryAPIURL)
      .then((res) => res.json())
      .then((json) => {
        json.metadata.name = this.state.exposedAPI.metadata.name;
        this.setState({exposedAPI: json})
        this.getResource(config.CoreAPI, config.ServicesResource, json.spec.implementation);
        this.getResource(config.CoreAPI, config.EndpointsResource, json.spec.implementation);
      });
    }

  getResource(inAPI, inResource, inResourceName) {
    /**
     * Retrieves a resource specified by inResource from the Kubernetes API server,
     * and sets it in the component's state. If inResource is a Service,
     * then it also retrieves the corresponding pods with a selector 
     * based on the service's spec.selector.
     * 
     * @param {string} inAPI - The base URL of the API server to fetch from.
     * @param {string} inResource - The resource type to fetch.
     * @param {string} inResourceName - The name of the resource to fetch.
     */
    const queryAPIURL = config.k8sAPIBaseUrl + inAPI + 'namespaces/' + config.ComponentsNamespace + inResource + inResourceName
    console.log(queryAPIURL)
    fetch(queryAPIURL)
      .then((res) => res.json())
      .then((json) => {  
        var newState = {}
        newState[json.kind] = json
        this.setState(newState)
        if (inResource === config.ServicesResource) {
          var keys = Object.keys(json.spec.selector)
          var selector = config.LabelSelector + keys[0] + '=' + json.spec.selector[keys[0]]
          this.getResources(config.CoreAPI, config.PodsResource, selector, 'pods');
        }
      });
    }

  getResources(inAPI, inResource, inResourceSelector, inResourceName) {
    /**
     * Retrieves a list of resources specified by inResource from the Kubernetes API server,
     * and sets it in the component's state.
     * 
     * @param {string} inAPI - The base URL of the API server to fetch from.
     * @param {string} inResource - The resource type to fetch.
     * @param {string} inResourceSelector - The selector to use to filter the resources.
     * @param {string} inResourceName - The name of the resource to fetch.
    */
    const queryAPIURL = config.k8sAPIBaseUrl + inAPI + 'namespaces/' + config.ComponentsNamespace + inResource + inResourceSelector
    console.log(queryAPIURL)
    fetch(queryAPIURL)
      .then((res) => res.json())
      .then((json) => {
        var newState = {}
        newState[inResourceName] = json.items
        this.setState(newState)       
      });
    }  

  refreshData() {
    /**
     * Refreshes the data for the ExposedAPI.
     */
    this.getExposedAPI();
    // refresh the data every 5 seconds
    var interval = 5000
    this.timeoutFunction = setTimeout(() => { this.refreshData() }, interval);
  }

  componentDidMount() {
    /**
     * Called when the component is mounted and loads the data for the ExposedAPI.
     */ 
    this.refreshData();
  }

  componentWillUnmount() {
    /**
     * Called when the component is unmounted.
     * Clears the timeout function.
     */
    clearTimeout(this.timeoutFunction);
  }

  getRAG(inDeploymentStatus){
    /**
     * Returns the RAG status for the deployment.
    */
    var ragColor = "amber"
    if (inDeploymentStatus === 'Complete') {
      ragColor = "green"
    }
    return ragColor
  }

  render() {
    /**
     * The render() function is a method in a React component class that returns a JSX element to be rendered to the DOM.
     * This function is called whenever the component's state or props are updated. This function
     * renders the component for displaying an Exposed API. If the API is not found, a 404 message is displayed. 
     * If the Service and Endpoints state objects are present, the Endpoints data is added to the Service status.
     * The component includes the following information:
     * - Component Name
     * - Cluster URL
     * - Gateway URL
     * - Service
     * - Pods
     * @return {jsx} the JSX for the component
     */ 
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
              <CompTDLeft>{('status' in exposedAPI) && (<span> <RAGStatus size="10px" status={getAPIRAG(exposedAPI.status.implementation)} /> &nbsp; {exposedAPI.status.apiStatus.url} </span>)}</CompTDLeft>
            </CompTR>          
            <CompTR>
              <CompTDRight>Service:</CompTDRight>
              <CompTDLeft>{('Service' in this.state) && ( <ResourceDetails title="Service" resource={this.state.Service}/> )}</CompTDLeft>
            </CompTR>          
            <CompTR>
              <CompTDRight>Pods:</CompTDRight>
              <CompTDLeft>{('pods' in this.state) && ( <ResourcesDetails title="Pods" resources={this.state.pods}/> )}</CompTDLeft>
            </CompTR>          
          </tbody>
        </CompTableWide>
      </div>
    );
  }
};

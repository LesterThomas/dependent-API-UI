
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import config from '../../../config/config';
import RAGStatus from '../RAGStatus';

class ExposedAPIs extends Component {

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
      console.log('in constructor');
      console.log(this.state);
  };

  getExposedAPIs() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.ODAAPIVersion + 'namespaces/' + config.ComponentsNamespace + config.ExposedAPIsResource)
      .then((res) => res.json())
      .then((json) => {
        console.log('in getExposedAPIs');
        console.log(json);
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
          console.log('Adding ' + apiItem.name);
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
  
      <div class="Component-body">
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

export default ExposedAPIs;
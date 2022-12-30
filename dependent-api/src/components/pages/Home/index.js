
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';

class Home extends Component {

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
      ],
      data: []
      };
      console.log('in constructor');
      console.log(this.state);
  };

  getExposedAPIs() {
    fetch('http://localhost:8001/k8s/clusters/c-7rxjk/apis/oda.tmforum.org/v1alpha4/apis')
      .then((res) => res.json())
      .then((json) => {
        var apiList = json.items;
        var apiStateData = [];
        for (var i = 0; i < apiList.length; i++) {
          var apiItem = {
            id: i,
            componentName: apiList[i].metadata.ownerReferences[0].name,
            name: apiList[i].metadata.name,
            clusterUrl: apiList[i].status.apiStatus.implementation + '.components.svc.cluster.local',
            gatewayUrl: apiList[i].status.apiStatus.url
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
    console.log('in render');
    console.log(this.state);
    return (
  
      <div>
        <header>
          <h1>Manage API Dependencies</h1>
          <p>APIs exposed in the current cluster</p>
          <DataTable
              columns={this.state.columns}
              data={this.state.data}
              selectableRows
              highlightOnHover
              striped
              selectableRowsSingle
          />
        </header>
      </div>
    );
  }
};

export default Home;
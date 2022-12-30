
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import config from '../../../config/config';

class ODAComponents extends Component {

  constructor(props) {
    super(props);
    this.state = {
      columns: [     
        {
        name: 'Name',
        selector: row => row.name,
        sortable: true
        },
        {
          name: 'Deployment Status',
          selector: row => row.deploymentStatus,
          sortable: true
      }
      ],
      data: []
      };
      console.log('in constructor');
      console.log(this.state);
  };

  getODAComponents() {
    fetch(config.k8sAPIBaseUrl + config.ODAAPI + config.k8sAPIVersion + 'components')
      .then((res) => res.json())
      .then((json) => {
        console.log('in getODAComponents');
        console.log(json);
        var apiList = json.items;
        var componentStateData = [];
        for (var i = 0; i < apiList.length; i++) {
          var componentItem = {
            id: i,
            name: apiList[i].metadata.name,
            deploymentStatus: apiList[i].status["summary/status"].deployment_status
          }
          console.log('Adding ' + componentItem.name);
          componentStateData.push(componentItem);
        }
        this.setState({ data: componentStateData })

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

export default ODAComponents;
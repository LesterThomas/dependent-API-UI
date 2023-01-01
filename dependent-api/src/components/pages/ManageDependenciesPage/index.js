import React from 'react';
import { ExposedAPIs } from '../../common/ExposedAPIs';

const ManageDependenciesPage = () => {
  return (
    <div className="Page-body">
      <h1>Manage API Dependencies</h1>
      <ExposedAPIs />
    </div>
  );
}

export default ManageDependenciesPage;
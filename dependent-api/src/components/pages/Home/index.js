import React from 'react';
import ExposedAPIs from '../../common/ExposedAPIs';
import ODAComponents from '../../common/ODAComponents';

const Home = () => {
  return (
    <div>
      <h1>View Components</h1>
      <ODAComponents />
      <h1>Manage API Dependencies</h1>
      <ExposedAPIs />
    </div>
  );
}

export default Home;
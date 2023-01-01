import React from 'react';
import { ExposedAPI } from '../../common/ExposedAPIs';
import { useParams } from 'react-router-dom';

const ExposedAPIPage = () => {
  const { name } = useParams();
  return (
    <div className="Page-body">
      <ExposedAPI name={name}/>
    </div>
  );
}

export default ExposedAPIPage;
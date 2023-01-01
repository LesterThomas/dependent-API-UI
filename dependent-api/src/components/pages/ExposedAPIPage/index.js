import React from 'react';
import { ExposedAPI } from '../../common/ExposedAPIs';
import { useParams } from 'react-router-dom';

const ExposedAPIPage = () => {
  const { name } = useParams();
  console.log('ExposedAPIPage: name = ' + name)
  return (
    <div class="Page-body">
      <ExposedAPI name={name}/>
    </div>
  );
}

export default ExposedAPIPage;
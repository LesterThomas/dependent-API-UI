import React from 'react';
import { ODAComponent } from '../../common/ODAComponents';
import { useParams } from 'react-router-dom';

const ODAComponentPage = () => {
  const { name } = useParams();
  console.log('ODAComponentPage: name = ' + name)
  return (
    <div class="Page-body">
      <ODAComponent name={name}/>
    </div>
  );
}

export default ODAComponentPage;
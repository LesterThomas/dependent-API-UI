// create a component for the RAG status box
function RAGStatus(props) {
  const { status } = props;  // status can be "red", "amber", or "green"

  var size = '15px';
  if ('size' in props) {
    size = props.size;
  }

  let color = 'gray';
  if (status === 'red') {
    color = 'red';
  } else if (status === 'amber') {
    color = 'orange';
  } else if (status === 'green') {
    color = 'green';
  }

  return (
    
    <div
      className="rag-box"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        display: 'inline-block'
      }}
    />
  );
}

export default RAGStatus;
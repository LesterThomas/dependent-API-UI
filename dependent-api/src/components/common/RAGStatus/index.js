// create a component for the RAG status box
function RAGStatus(props) {
  const { state } = props;  // state can be "red", "amber", or "green"

  let color = 'gray';
  if (state === 'red') {
    color = 'red';
  } else if (state === 'amber') {
    color = 'orange';
  } else if (state === 'green') {
    color = 'green';
  }

  return (
    
    <div
      className="rag-box"
      style={{
        width: '15px',
        height: '15px',
        backgroundColor: color,
        display: 'inline-block'
      }}
    />
  );
}

export default RAGStatus;
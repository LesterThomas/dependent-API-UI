import {  BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './components/pages/HomePage';
import ODAComponentsPage from './components/pages/ODAComponentsPage';
import ODAComponentPage from './components/pages/ODAComponentPage';
import ManageDependenciesPage from './components/pages/ManageDependenciesPage';

const NavTabs = () => (
  <ul style={{
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#282c34',
  }}>
    <li style={{ float: 'left' }}>
      <Link to="/" style={{
        display: 'block',
        color: 'white',
        textAlign: 'center',
        padding: '14px 16px',
        textDecoration: 'none',
      }}>
        Home
      </Link>
    </li>
    <li style={{ float: 'left' }}>
      <Link to="/components" style={{
        display: 'block',
        color: 'white',
        textAlign: 'center',
        padding: '14px 16px',
        textDecoration: 'none',
      }}>
        Components
      </Link>
    </li>
    <li style={{ float: 'left' }}>
      <Link to="/dependencies" style={{
        display: 'block',
        color: 'white',
        textAlign: 'center',
        padding: '14px 16px',
        textDecoration: 'none',
      }}>
        Dependencies
      </Link>
    </li>
  </ul>
);


function App() {
  return (
    <BrowserRouter>
      <div className="App">

        <NavTabs /> 

        <div className="App-body">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/components" element={<ODAComponentsPage />} />
            <Route path="/components/:name" element={<ODAComponentPage />} />
            <Route path="/dependencies" element={<ManageDependenciesPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;


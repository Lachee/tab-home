import logo from './logo.svg';
import './App.scss';
import { Button } from 'react-bulma-components';
import { Shortcut } from './Shortcut';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <Button color="primary">This is a test button</Button>
        </p>
          <Shortcut link="https://chickatrice.net"></Shortcut>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

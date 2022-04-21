import logo from './logo.svg';
import './App.scss';
import { Button } from 'react-bulma-components';
import { Shortcut, ShortcutList } from './Shortcut';

const links = [
  'https://chickatrice.net',
  'https://twitter.com',
  'https://lachee.dev'
]

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Button color="primary">This is a test button</Button>
        <ShortcutList links={links}></ShortcutList>
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

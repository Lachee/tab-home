import logo from './logo.svg';
import './App.scss';
import { ShortcutList } from './Shortcut';
import { Search } from './Search';

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
        <Search engine="ddg"></Search>
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

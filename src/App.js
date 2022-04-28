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
        <Search engine="ddg"></Search>
        <ShortcutList links={links}></ShortcutList>
      </header>
    </div>
  );
}

export default App;

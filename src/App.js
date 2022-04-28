import logo from './logo.svg';
import './App.scss';
import { ShortcutList } from './Shortcut';
import { Search } from './Search';
import { Block, Container, Hero, Level } from 'react-bulma-components';

const links = [
  'https://chickatrice.net',
  'https://twitter.com',
  'https://lachee.dev'
]

function App() {
  return (
    <div className="App">
      <Hero backgroundColor='dark' className='is-fullheight'>
        <Hero.Body className="is-fullwidth">
          <Container>
            
          <Block>
            <Search engine="ddg"></Search>
          </Block>
          <Block>
            <ShortcutList links={links}></ShortcutList>
          </Block>
          </Container>
        </Hero.Body>
      </Hero>
    </div>
  );
}

export default App;

import { ShortcutList } from '../Shortcut';
import { Search } from '../Search';
import { Block, Container, Hero, Level } from 'react-bulma-components';
import logo from '../logo.svg';

const links = [
    'https://chickatrice.net',
    'https://twitter.com',
    'https://lachee.dev'
];


export const Home = () => {
    return (
        <div>
            <Hero backgroundColor='dark' className='is-fullheight'>
                <Hero.Body className="is-fullwidth">
                    <Container>
                        <Block>
                            <Search engine="ddg" autoFocus={true}></Search>
                            <p>Focus Addressbar with <kbd>ctrl + L</kbd></p>
                        </Block>
                        <Block>
                            <ShortcutList links={links}></ShortcutList>
                        </Block>
                    </Container>
                </Hero.Body>
            </Hero>
        </div>
    )
};
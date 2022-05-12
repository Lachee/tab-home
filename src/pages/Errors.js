import { Block, Container, Hero, Level } from 'react-bulma-components';

export const Error404 = () => {
    return (
        <section class="hero is-danger is-fullheight ">
            <div class="hero-body">
                <div class="">
                    <p class="title">
                        Page Not Found
                    </p>
                    <p class="subtitle">
                        Sorry, that page doesn't seem to exist :c
                    </p>
                </div>
            </div>
        </section>
    )
};
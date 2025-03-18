import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <h1>My Application</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/login">Login</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;

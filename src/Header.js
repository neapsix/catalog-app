import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css'
import React from 'react'
import { Navbar, Container } from 'react-bootstrap';

function Header() {
    return (
        <header className="App-header">
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand>Catalog App</Navbar.Brand>
                </Container>
            </Navbar>
        </header>
    )
}
export default Header
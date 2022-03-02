import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css'
import React from 'react'
import { Navbar, Container, Col } from 'react-bootstrap';
import FilterFormField from './FilterFormField'

class Header extends React.Component {
    render() {
        return (
            <header>
                <Navbar bg="light" expand="lg" className="App-header">
                    <Container>
                        <Col xs={6} lg={8} xl={10}>
                            <Navbar.Brand>Catalog App</Navbar.Brand>
                        </Col>
                        <Col>
                        <FilterFormField
                            callback={this.props.handleIncludeString}
                        />
                        </Col>
                    </Container>
                </Navbar>
            </header>
        )
    }
}

export default Header;

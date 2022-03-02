import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css'
import React from 'react'
import { Navbar, Container, Col, Button } from 'react-bootstrap';
import DownloadCSVButton from './DownloadCSVButton';
import FilterFormField from './FilterFormField'

class Header extends React.Component {
    render() {
        return (
            <header>
                <Navbar bg="light" expand="lg" className="App-header">
                    <Container>
                        <Col xs={12} lg={8} xl={10}>
                            <Navbar.Brand>Catalog App</Navbar.Brand>
                            <Button variant="link" size="sm" onClick={this.props.handleResetAll}>
                                Reset all
                            </Button>
                            <DownloadCSVButton
                                filename={this.props.downloadFilename}
                                data={this.props.downloadData}
                            />
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

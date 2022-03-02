import 'bootstrap/dist/css/bootstrap.min.css'
import './Header.css'
import React from 'react'
import { Navbar, Container, Col, Button, ToggleButton } from 'react-bootstrap'
import DownloadCSVButton from './DownloadCSVButton'
import FilterFormField from './FilterFormField'

class Header extends React.Component {
    // From bootstrap-icons: funnel
    filterIcon() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-funnel"
                viewBox="0 0 16 16"
            >
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
            </svg>
        )
    }

    render() {
        return (
            <header>
                <Navbar bg="light" expand="lg" className="App-header">
                    <Container fluid>
                        <Col xs={12} lg={8} xl={10} className="p-1">
                            <Navbar.Brand>Catalog App</Navbar.Brand>
                            <Navbar.Text>
                                <ToggleButton
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={this.props.handleFilterCollapse}
                                    type="checkbox"
                                    checked={this.props.filtersOpen}
                                >
                                    {this.filterIcon()}
                                </ToggleButton>
                            </Navbar.Text>{' '}
                            <Navbar.Text>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={this.props.handleResetAll}
                                >
                                    Reset all
                                </Button>
                            </Navbar.Text>{' '}
                            <Navbar.Text>
                                <DownloadCSVButton
                                    filename={this.props.downloadFilename}
                                    data={this.props.downloadData}
                                />
                            </Navbar.Text>
                        </Col>
                        <Col className="p-1">
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

export default Header

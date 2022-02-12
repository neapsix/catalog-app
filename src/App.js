import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import React from 'react'
import { Navbar, Container, Row, Col, Table, Form, Card } from 'react-bootstrap';

const cols = [
    // {
    //     label: 'ID',
    //     key: 'id',
    // },
    {
        label: 'Name',
        key: 'name',
    },
    {
        label: 'Species',
        key: 'species',
    },
    {
        label: 'Color',
        key: 'color',
    },
]

const db = [
    {
        id: 1,
        name: 'Berlioz',
        species: 'cat',
        color: 'tuxedo',
    },
    {
        id: 2,
        name: 'O\'Malley',
        species: 'cat',
        color: 'orange',
    },
    {
        id: 5,
        name: 'Patou',
        species: 'dog',
        color: 'brown',
    },
    {
        id: 4,
        species: 'blue-tongued skink',
        color: 'gray',
    },
]

class AppContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = { includeString: '', excludes: [] }

        this.handleExcludes = this.handleExcludes.bind(this)
        this.handleIncludeString = this.handleIncludeString.bind(this)
    }

    addExcludes(...args) {
        this.setState((state) => {
            return { excludes: [...state.excludes, ...args] }
        })
    }

    removeExcludes(...args) {
        args.forEach((argsItem) =>
            this.setState((state) => {
                return {
                    excludes: state.excludes.filter(
                        (excludesItem) => excludesItem !== argsItem
                    ),
                }
            })
        )
    }

    handleExcludes(filterString, value) {
        if (!value) {
            this.addExcludes(filterString)
        } else {
            this.removeExcludes(filterString)
        }
    }

    handleIncludeString(filterString) {
        this.setState({ includeString: filterString })
    }

    generateFilterOptions(key) {
        return [...new Set(this.props.data.map((object) => object[key]))]
    }

    render() {
        console.log(JSON.stringify(this.state))
        return (
            <Container fluid="lg">
                <Row>
                    <Col xs={3}>
                        <Card>
                            <Card.Header>
                                <Card.Title>Filters</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <FilterForm
                                    filterOptions={this.generateFilterOptions("species")}
                                    handleExcludes={this.handleExcludes}
                                    handleIncludeString={this.handleIncludeString}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Header>
                                <Row>
                                    <Col>
                                        <Card.Title>Catalog</Card.Title>
                                    </Col>
                                    <Col>
                                        <FilterFormField callback={this.handleIncludeString} />
                                    </Col>
                                </Row>
                            </Card.Header>
                            <Card.Body>
                                <CatalogTable 
                                    columns={this.props.fields} 
                                    data={this.props.data} 
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        )
    }
}

class CatalogTable extends React.Component {
    headerRow() {
        return (
            <tr>
                {this.props.columns.map((column) => {
                    return <th>{column.label}</th>
                })}
            </tr>
        )
    }

    dataRows() {
        return this.props.data.map((object) => {
            return (
                <tr>
                    {this.props.columns.map((column) => {
                        return <td>{object[column.key]}</td>
                    })} 
                </tr>
            )
        })
    }

    render() {
        return (
            <>
                <Table striped bordered hover>
                    <thead>
                        {this.headerRow()}
                    </thead>
                    <tbody>
                        {this.dataRows()}
                    </tbody>
                </Table>
            </>
        )
    }
}

class FilterForm extends React.Component {
    render() {
        return (
            <Form.Group>
                <FilterFormList
                    filterOptions={this.props.filterOptions}
                    callback={this.props.handleExcludes}
                />
            </Form.Group>
        )
    }
}

class FilterFormList extends React.Component {
    render() {
        return this.props.filterOptions.map((filterString) => {
            return (
                <FilterFormCheckbox
                    label={filterString}
                    callback={this.props.callback}
                />
            )
        })
    }
}

class FilterFormCheckbox extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    render() {
        return (
            <Form.Check
                type="checkbox"
                label={this.props.label}
                defaultChecked="true"
                onChange={this.handleChange} 
            />
        )
    }

    handleChange(event) {
        this.props.callback(this.props.label, event.target.checked)
    }
}

class FilterFormField extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    render() {
        return (
            <Form.Control 
                size="sm" 
                type="text" 
                placeholder="Filter" 
                onChange={this.handleChange}
            />
        )
    }

    handleChange(event) {
        this.props.callback(event.target.value)

        event.preventDefault()
    }
}

function App() {
    return (
        <div className="App">
            <AppContainer name="Commands App Container" fields={cols} data={db} />
        </div>
    )
}

export default App

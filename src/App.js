import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import React from 'react'
import { Container, Row, Col, Table, Form, Button, Card } from 'react-bootstrap'

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
        name: "O'Malley",
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

function initialState() {
    return { includeString: '', excludes: [] }
}

class AppContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = initialState()

        this.handleExcludes = this.handleExcludes.bind(this)
        this.handleIncludeString = this.handleIncludeString.bind(this)
        this.explode = this.explode.bind(this)

        this.key = 0
    }

    addExcludes(...args) {
        this.setState((state) => {
            return { excludes: [...state.excludes, ...args] }
        })
    }

    removeExcludes(...args) {
        args.forEach((argsObject) =>
            this.setState((state) => {
                return {
                    excludes: state.excludes.filter((stateObject) => {
                        // Objects in the current state.excludes array
                        // pass the filter if they aren't equal to the
                        // object that we're removing.

                        // Check deep equality for the two objects.

                        // Do they have the same number of keys?
                        const argsObjectKeys = Object.keys(argsObject)
                        const stateObjectKeys = Object.keys(stateObject)

                        if (argsObjectKeys.length !== stateObjectKeys.length) {
                            return true
                        }

                        // If so, for each key, do they have the same value?
                        for (let key of argsObjectKeys) {
                            if (argsObject[key] !== stateObject[key]) {
                                return true
                            }
                        }

                        // If not, they're equal, so this object in the
                        // state.excludes array doesn't pass the filter.
                        return false
                    }),
                }
            })
        )
    }

    handleExcludes(filterObject, value) {
        if (!value) {
            this.addExcludes(filterObject)
        } else {
            this.removeExcludes(filterObject)
        }
    }

    handleIncludeString(filterString) {
        this.setState({ includeString: filterString })
    }

    generateFilterOptions(key) {
        return [...new Set(this.props.data.map((object) => object[key]))]
    }

    filterDataExcludes(data) {
        const newData = data.filter((row) => {
            // Check each object in the state.excludes array against the row.
            for (let element of this.state.excludes) {
                const columnToCheck = Object.keys(element)[0]
                const valueToExclude = element[columnToCheck]

                // If the row has the value to exclude in the specified
                //  column, don't include it in the filtered array.
                if (row[columnToCheck] === valueToExclude) {
                    return false
                }
            }

            // Otherwise, include the row in the filtered array.
            return true
        })

        return newData
    }

    filterDataIncludeString(data) {
        const newData = data.filter((row) => {
            const rowString = JSON.stringify(row).toLowerCase()
            const includeString = this.state.includeString.toLowerCase()

            return rowString.includes(includeString)
        })

        return newData
    }

    explode() {
        this.setState(initialState())
        ++this.key
    }

    render() {
        let filteredData = []

        if (this.state.excludes[0]) {
            filteredData = this.filterDataExcludes(this.props.data)
        } else {
            filteredData = this.props.data
        }

        if (this.state.includeString) {
            filteredData = this.filterDataIncludeString(filteredData)
        }

        return (
            <Container fluid="lg" key={this.key}>
                <Row>
                    <Col xs={3}>
                        <FilterCard
                            title="Species"
                            filterOptions={this.generateFilterOptions(
                                'species'
                            )}
                            forColumn="species"
                            handleExcludes={this.handleExcludes}
                        />
                        <Button variant="link" size="sm" onClick={this.explode}>
                            Reset all
                        </Button>
                    </Col>
                    <Col>
                        <CatalogTableCard
                            title="Catalog"
                            handleIncludeString={this.handleIncludeString}
                            columns={this.props.fields}
                            data={filteredData}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

class CatalogTableCard extends React.Component {
    render() {
        return (
            <Card>
                <Card.Header>
                    <Row>
                        <Col>
                            <Card.Title>{this.props.title}</Card.Title>
                        </Col>
                        <Col>
                            <FilterFormField
                                callback={this.props.handleIncludeString}
                            />
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <CatalogTable
                        columns={this.props.columns}
                        data={this.props.data}
                    />
                </Card.Body>
            </Card>
        )
    }
}

class CatalogTable extends React.Component {
    headerRow() {
        return (
            <tr key="0">
                {this.props.columns.map((column, index) => {
                    return <th key={index}>{column.label}</th>
                })}
            </tr>
        )
    }

    dataRows() {
        return this.props.data.map((object, index) => {
            return (
                <tr key={index}>
                    {this.props.columns.map((column, index) => {
                        return <td key={index}>{object[column.key]}</td>
                    })}
                </tr>
            )
        })
    }

    render() {
        // Show a zero state instead of the table if there's no data.
        if (!this.props.data.length) {
            return <div className="Card-zerostate">Nothing to show</div>
        }

        return (
            <>
                <Table striped bordered hover>
                    <thead>{this.headerRow()}</thead>
                    <tbody>{this.dataRows()}</tbody>
                </Table>
            </>
        )
    }
}

class FilterCard extends React.Component {
    render() {
        return (
            <Card>
                <Card.Header>
                    <Card.Title>{this.props.title}</Card.Title>
                </Card.Header>
                <Card.Body>
                    <FilterForm
                        filterOptions={this.props.filterOptions}
                        forColumn={this.props.forColumn}
                        handleExcludes={this.props.handleExcludes}
                    />
                </Card.Body>
            </Card>
        )
    }
}

class FilterForm extends React.Component {
    render() {
        return (
            <Form.Group>
                <FilterFormList
                    filterOptions={this.props.filterOptions}
                    forColumn={this.props.forColumn}
                    callback={this.props.handleExcludes}
                />
            </Form.Group>
        )
    }
}

class FilterFormList extends React.Component {
    render() {
        return (
            <ul className="ul-checkbox">
                {this.props.filterOptions.map((filterString, index) => {
                    return (
                        <li key={index}>
                            <FilterFormCheckbox
                                label={filterString}
                                field={this.props.forColumn}
                                callback={this.props.callback}
                            />
                        </li>
                    )
                })}
            </ul>
        )
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
        const filterObject = {}
        filterObject[this.props.field] = this.props.label
        this.props.callback(filterObject, event.target.checked)
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
            <AppContainer
                name="Commands App Container"
                fields={cols}
                data={db}
            />
        </div>
    )
}

export default App

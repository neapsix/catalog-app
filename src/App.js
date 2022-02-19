import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import React from 'react'
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Modal,
    Form,
    Button,
} from 'react-bootstrap'
import { CSVLink } from 'react-csv'

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
    {
        id: 6,
        name: 'Scat Cat',
        species: 'cat',
        color: 'tuxedo',
    },
    {
        id: 7,
        name: 'Uncle Waldo',
        species: 'goose',
        color: 'white',
        possessions: 'great hat',
    },
    {
        id: 8,
        name: 'Toulouse',
        species: 'cat',
        color: 'orange',
    },
    {
        id: 1,
        name: 'Marie',
        species: 'cat',
        color: 'white',
    },
]

const multiFiltersColor = [
    {
        label: 'orange, tuxedo, or blue',
        filters: [{ color: 'tuxedo' }, { color: 'orange' }, { color: 'blue' }],
    },
    {
        label: 'brown or gray',
        filters: [{ color: 'brown' }, { color: 'gray' }],
    },
]

const multiFiltersVarious = [
    {
        label: 'cat or gray',
        filters: [{ species: 'cat' }, { color: 'gray' }],
    },
    {
        label: 'Berlioz or skink',
        filters: [{ name: 'Berlioz' }, { species: 'blue-tongued skink' }],
    },
]

class AppContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = this.initialState()

        this.handleExcludes = this.handleExcludes.bind(this)
        this.handleIncludeString = this.handleIncludeString.bind(this)
        this.handleSortColumn = this.handleSortColumn.bind(this)
        this.explode = this.explode.bind(this)

        this.key = 0
    }

    initialState() {
        return {
            includeString: '',
            excludes: [],
            sortColumn: 'name',
            sortAscending: true,
        }
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

    handleExcludes(value, args) {
        if (!value) {
            this.addExcludes(...args)
        } else {
            this.removeExcludes(...args)
        }
    }

    handleIncludeString(filterString) {
        this.setState({ includeString: filterString })
    }

    handleSortColumn(columnKey) {
        if (columnKey === this.state.sortColumn) {
            this.setState({ sortAscending: !this.state.sortAscending })
        } else {
            this.setState({ sortColumn: columnKey, sortAscending: true })
        }
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
        this.setState(this.initialState())
        ++this.key
    }

    render() {
        // Apply filters
        let filteredData = []

        if (this.state.excludes[0]) {
            filteredData = this.filterDataExcludes([...this.props.data])
        } else {
            filteredData = [...this.props.data]
        }

        if (this.state.includeString) {
            filteredData = this.filterDataIncludeString(filteredData)
        }

        // Apply sorting
        /* Note: At time of writing, the sort() function behaves differently 
        between browsers. In Firefox and Safari, return values true and false 
        are the same as 1 and -1. In Chrome, they must be 1 and -1. */
        const sortedAndFilteredData = [...filteredData].sort((a, b) => {
            const aValue = a[this.state.sortColumn]
            const bValue = b[this.state.sortColumn]

            // Don't compare values if either one is undefined. Return the
            // appropriate values to always put undefined rows at the bottom.
            if (!aValue) {
                return 1
            }
            if (!bValue) {
                return -1
            }

            // When sorting descending, return true if b should come before a.
            if (!this.state.sortAscending) {
                return aValue < bValue ? -1 : 1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        // Render everything
        return (
            <Container fluid="lg" key={this.key}>
                <Row>
                    <Col xs={12} lg={4} xl={3}>
                        <FilterCard
                            title="Species"
                            filterOptions={this.generateFilterOptions(
                                'species'
                            )}
                            forColumn="species"
                            handleExcludes={this.handleExcludes}
                        />
                        <FilterCard
                            title="Color and Multi-Filters"
                            filterOptions={this.generateFilterOptions('color')}
                            overrideLabels={[{ orange: 'tabby' }]}
                            forColumn="color"
                            multiFilters={multiFiltersColor}
                            handleExcludes={this.handleExcludes}
                        />
                        <FilterCard
                            title="Multi-Filters"
                            multiFilters={multiFiltersVarious}
                            handleExcludes={this.handleExcludes}
                        />
                        <Button variant="link" size="sm" onClick={this.explode}>
                            Reset all
                        </Button>
                        <DownloadCSVButton
                            filename={'catalog_filtered.csv'}
                            data={sortedAndFilteredData}
                        />
                    </Col>
                    <Col xs={12} lg={8} xl={9}>
                        <CatalogTableCard
                            title="Catalog"
                            columns={this.props.fields}
                            data={sortedAndFilteredData}
                            handleIncludeString={this.handleIncludeString}
                            sortColumn={this.state.sortColumn}
                            sortAscending={this.state.sortAscending}
                            handleSortColumn={this.handleSortColumn}
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
            <Card className="CatalogTableCard">
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
                        sortColumn={this.props.sortColumn}
                        sortAscending={this.props.sortAscending}
                        handleSortColumn={this.props.handleSortColumn}
                    />
                </Card.Body>
            </Card>
        )
    }
}

class CatalogTable extends React.Component {
    headerRow() {
        return (
            <CatalogTableHeaderRow
                columns={this.props.columns}
                sortColumn={this.props.sortColumn}
                sortAscending={this.props.sortAscending}
                callback={this.props.handleSortColumn}
            />
        )
    }

    dataRows() {
        return this.props.data.map((object, index) => {
            return (
                <CatalogTableDataRow
                    key={index}
                    object={object}
                    columns={this.props.columns}
                />
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
                <Table responsive striped bordered hover>
                    <thead>{this.headerRow()}</thead>
                    <tbody>{this.dataRows()}</tbody>
                </Table>
            </>
        )
    }
}

class CatalogTableHeaderRow extends React.Component {
    render() {
        return (
            <tr key="0">
                {this.props.columns.map((column, index) => {
                    let sortIndicator
                    if (this.props.sortColumn === column.key) {
                        if (this.props.sortAscending) {
                            sortIndicator = (
                                // From bootstrap-icons: caret-up-fill
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-chevron-up"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
                                    />
                                </svg>
                            )
                        } else {
                            sortIndicator = (
                                // From bootstrap-icons: caret-down-fill
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-chevron-down"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                                    />
                                </svg>
                            )
                        }
                    }

                    return (
                        <th
                            key={index}
                            onClick={() => this.props.callback(column.key)}
                        >
                            {column.label} {sortIndicator}
                        </th>
                    )
                })}
            </tr>
        )
    }
}

class CatalogTableDataRow extends React.Component {
    constructor(props) {
        super(props)

        // Store state in the row for showing the modal Details form
        this.state = { show: false }

        this.handleClick = this.handleClick.bind(this)
    }

    // When you click a row, flip the state that's passed down to the modal
    handleClick() {
        this.setState({ show: !this.state.show })
    }

    render() {
        return (
            // Add a row and a cell for each column in the object, plus a
            // hidden ("d-none") cell to hold the modal Details form.
            <tr onClick={this.handleClick}>
                {this.props.columns.map((column, index) => {
                    return <td key={index}>{this.props.object[column.key]}</td>
                })}
                <td className="d-none">
                    <CatalogItemDetailsModal
                        show={this.state.show}
                        handleClick={this.handleClick}
                        object={this.props.object}
                    />
                </td>
            </tr>
        )
    }
}

class CatalogItemDetailsModal extends React.Component {
    render() {
        return (
            // Note: the modal needs to stop propagation on click, or
            // else the click gets hijacked by the onClick() function
            // of the parent. If that happens, the modal incorrectly
            // closes when you click inside it.
            <Modal
                show={this.props.show}
                onHide={this.props.handleClick}
                onClick={(e) => e.stopPropagation()}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CatalogItemDetailsText object={this.props.object} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.props.handleClick}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

class CatalogItemDetailsText extends React.Component {
    render() {
        return Object.keys(this.props.object).map((element, index) => {
            return (
                <React.Fragment key={index}>
                    <h5>{element}</h5>
                    <p>{this.props.object[element]}</p>
                </React.Fragment>
            )
        })
    }
}

class FilterCard extends React.Component {
    render() {
        return (
            <Card className="FilterCard">
                <Card.Header>
                    <Card.Title>{this.props.title}</Card.Title>
                </Card.Header>
                <Card.Body>
                    <FilterForm
                        title={this.props.title}
                        filterOptions={this.props.filterOptions}
                        overrideLabels={this.props.overrideLabels}
                        forColumn={this.props.forColumn}
                        multiFilters={this.props.multiFilters}
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
                    title={this.props.title}
                    filterOptions={this.props.filterOptions}
                    overrideLabels={this.props.overrideLabels}
                    forColumn={this.props.forColumn}
                    multiFilters={this.props.multiFilters}
                    callback={this.props.handleExcludes}
                />
            </Form.Group>
        )
    }
}

class FilterFormList extends React.Component {
    constructor(props) {
        super(props)

        this.generateSingleFilters = this.generateSingleFilters.bind(this)
        this.generateMultiFilters = this.generateMultiFilters.bind(this)
    }

    generateSingleFilters() {
        if (!this.props.filterOptions) {
            return false
        }

        return this.props.filterOptions.map((filterString, index) => {
            let overrideLabel

            if (this.props.overrideLabels) {
                // Check override labels array to see if there's one for
                // this filterString. If not, the label is the filterString
                for (let element of this.props.overrideLabels) {
                    const optionToOverride = Object.keys(element)[0]

                    if (filterString === optionToOverride) {
                        overrideLabel = element[optionToOverride]
                    }
                }
            }

            return (
                <li key={index}>
                    <FilterFormCheckbox
                        id={this.props.title + index}
                        label={overrideLabel || filterString}
                        filterString={filterString}
                        field={this.props.forColumn}
                        callback={this.props.callback}
                    />
                </li>
            )
        })
    }

    generateMultiFilters() {
        if (!this.props.multiFilters) {
            return false
        }

        let indexOffset = 0
        if (this.props.filterOptions) {
            indexOffset = indexOffset + this.props.filterOptions.length
        }

        return this.props.multiFilters.map((multiFilterObject, index) => {
            const indexPlusOffset = indexOffset + index
            return (
                <li key={indexPlusOffset}>
                    <FilterFormMultiFilterCheckbox
                        id={this.props.title + indexPlusOffset}
                        label={multiFilterObject.label}
                        filters={multiFilterObject.filters}
                        callback={this.props.callback}
                    />
                </li>
            )
        })
    }

    render() {
        // Generate single filter checkboxes
        return (
            <ul className="ul-checkbox">
                {this.generateSingleFilters()}
                {this.generateMultiFilters()}
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
                id={this.props.id}
                type="checkbox"
                label={this.props.label}
                defaultChecked="true"
                onChange={this.handleChange}
            />
        )
    }

    handleChange(event) {
        const filterObject = {}
        filterObject[this.props.field] = this.props.filterString
        this.props.callback(event.target.checked, [filterObject])
    }
}

class FilterFormMultiFilterCheckbox extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    render() {
        return (
            <Form.Check
                id={this.props.id}
                type="checkbox"
                label={this.props.label}
                defaultChecked="true"
                onChange={this.handleChange}
            />
        )
    }

    handleChange(event) {
        this.props.callback(event.target.checked, this.props.filters)
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

class DownloadCSVButton extends React.Component {
    constructor(props) {
        super(props)

        // Define a ref to use for the secret CSV link
        this.csvLink = React.createRef()

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        // Click the hidden link by using the ref to access it
        this.csvLink.current.link.click()
    }

    render() {
        return (
            <>
                <Button variant="link" size="sm" onClick={this.handleClick}>
                    Download as CSV
                </Button>
                <CSVLink
                    data={this.props.data}
                    className="hidden"
                    ref={this.csvLink}
                    filename={this.props.filename}
                    target="_blank"
                />
            </>
        )
    }
}

function App() {
    return (
        <div className="App">
            <AppContainer
                name="Catalog App Container"
                fields={cols}
                data={db}
            />
        </div>
    )
}

export default App

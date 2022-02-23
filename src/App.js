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
import db from './data/db.json'
import cols from './data/cols.json'
import filters from './data/filters.json'

class AppContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = this.initialState()

        this.handleExcludes = this.handleExcludes.bind(this)
        this.handleIncludeString = this.handleIncludeString.bind(this)
        this.handleSortColumn = this.handleSortColumn.bind(this)
        this.buildFilterJSON = this.buildFilterJSON.bind(this)
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

    getUniqueValues(key) {
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

    buildFilterJSON(jsonString) {
        // The JSON string contains one or more objects that each represent a
        // card. We're doing some processing on each object in the JSON string
        // to return an updated JSON string.
        const newJSON = jsonString.map((cardObject) => {
            // Each card object contains one key, the card title. The value for
            // that key is an array containing some filter definitions.
            const keyString = Object.keys(cardObject)[0]

            // Begin a new JSON object. The new object will contain the same
            // key as the existing one, but we'll replace the value for it.
            let newCardObject = {}
            let newCardObjectData = []

            // Iterate over the elements within the existing array. Each one
            // is a JSON object, which either defines a filter checkbox or
            // indicates that we should generate some dynamically.
            for (const element of cardObject[keyString]) {
                // Type "auto" indicates we should dynamically generate filters
                if (element['type'] === 'auto') {
                    const column = element['forColumn']
                    const uniqueValues = this.getUniqueValues(column)

                    // Elements of type auto might specify the overrideLabels
                    // property, an array of pairs as {"replaceMe": "newLabel"}
                    const overrideLabels = element['overrideLabels']

                    // For each unique value, generate a filter definition
                    // using the same format as single filters (type custom)
                    for (const value of uniqueValues) {
                        let overrideLabel = ''

                        if (overrideLabels) {
                            // Check override labels array to see if there's one for
                            // this value. If not, the label is the value.
                            for (const label of overrideLabels) {
                                const optionToOverride = Object.keys(label)[0]

                                if (value === optionToOverride) {
                                    overrideLabel = label[optionToOverride]
                                }
                            }
                        }

                        // Define a filter checkbox for this value
                        let newFiltersObject = {}

                        let newFiltersObjectFilters = {}
                        newFiltersObjectFilters[column] = value
                        const newFiltersObjectFiltersArray = [
                            newFiltersObjectFilters,
                        ]

                        newFiltersObject['type'] = 'dynamic'
                        newFiltersObject['label'] = overrideLabel || value
                        newFiltersObject['filters'] =
                            newFiltersObjectFiltersArray

                        // Add each generated definition to the card data.
                        newCardObjectData.push(newFiltersObject)
                    }
                } else {
                    // For all other element types, such as "custom,"
                    // carry over the filter definition as is.
                    newCardObjectData.push(element)
                }
            }
            // Populate the final card object with the generated card data
            newCardObject[keyString] = newCardObjectData
            return newCardObject
        })
        // Return the final JSON string containing all the cards.
        return newJSON
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

        // Build filters JSON
        let filtersJSON = this.buildFilterJSON(this.props.filters)

        // Render everything
        return (
            <Container fluid="lg" key={this.key}>
                <Row>
                    <Col xs={12} lg={4} xl={3}>
                        {filtersJSON.map((object, index) => {
                            const keyString = Object.keys(object)[0]
                            return (
                                <FilterCard
                                    key={keyString}
                                    title={keyString}
                                    filters={object[keyString]}
                                    handleExcludes={this.handleExcludes}
                                />
                            )
                        })}
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
                        filters={this.props.filters}
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
                    filters={this.props.filters}
                    callback={this.props.handleExcludes}
                />
            </Form.Group>
        )
    }
}

class FilterFormList extends React.Component {
    constructor(props) {
        super(props)

        this.generateFilters = this.generateFilters.bind(this)
    }

    generateFilters() {
        if (!this.props.filters) {
            return false
        }

        return this.props.filters.map((filterObject, index) => {
            return (
                <li key={index}>
                    <FilterFormCheckbox
                        id={this.props.title + index}
                        label={filterObject.label}
                        filters={filterObject.filters}
                        callback={this.props.callback}
                    />
                </li>
            )
        })
    }

    render() {
        // Generate single filter checkboxes
        return <ul className="ul-checkbox">{this.generateFilters()}</ul>
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
                filters={filters}
            />
        </div>
    )
}

export default App

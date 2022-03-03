import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import React from 'react'
import {
    Container,
    Row,
    Col,
    Collapse,
} from 'react-bootstrap'
import Header from './Header'
import CatalogTable from './CatalogTable'
import CatalogFilters from './CatalogFilters'
import Footer from './Footer'
import db from '../data/db.json'
import cols from '../data/cols.json'
import filters from '../data/filters.json'

class AppContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = this.initialState()

        this.handleExcludes = this.handleExcludes.bind(this)
        this.handleIncludeString = this.handleIncludeString.bind(this)
        this.handleSortColumn = this.handleSortColumn.bind(this)
        this.handleFilterCollapse = this.handleFilterCollapse.bind(this)
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
            filtersOpen: true,
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

    handleFilterCollapse() {
        this.setState({ filtersOpen: !this.state.filtersOpen })
    }

    getUniqueValuesSorted(key) {
        const uniqueValues = new Set(this.props.data.map((object) => object[key]))

        const uniqueValuesSorted = [...uniqueValues].sort((a, b) => {

            // Don't compare values if either one is undefined. Return the
            // appropriate values to always put undefined rows at the bottom.
            if (!a) {
                return 1
            }
            if (!b) {
                return -1
            }

            return a < b ? -1 : 1
        })


        return uniqueValuesSorted
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
                    const uniqueValues = this.getUniqueValuesSorted(column)

                    // Elements of type auto might specify the overrideLabels
                    // property, an array of pairs as {"replaceMe": "newLabel"}
                    const overrideLabels = element['overrideLabels']

                    // For each unique value, generate a filter definition
                    // using the same format as single filters (type custom)
                    for (const value of uniqueValues) {
                        let overrideLabel = ''

                        if (!value) {
                          overrideLabel = 'Blanks'
                        }

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
            <>
                <Header
                    handleIncludeString={this.handleIncludeString}
                    handleResetAll={this.explode}
                    filtersOpen={this.state.filtersOpen}
                    handleFilterCollapse={this.handleFilterCollapse}
                    downloadFilename={'catalog_filtered.csv'}
                    downloadData={sortedAndFilteredData}
                />
                <Container fluid key={this.key}>
                    <Row>
                        <Collapse in={this.state.filtersOpen}>
                            <Col xs={12} lg={3} xxl={2}>
                                <CatalogFilters
                                    filtersJSON={filtersJSON}
                                    handleExcludes={this.handleExcludes}
                                    open={this.state.filtersOpen}
                                />
                            </Col>
                        </Collapse>
                        <Col className="Scroll-horizontal-only">
                            <CatalogTable
                                columns={this.props.fields}
                                data={sortedAndFilteredData}
                                sortColumn={this.state.sortColumn}
                                sortAscending={this.state.sortAscending}
                                handleSortColumn={this.handleSortColumn}
                            />
                        </Col>
                    </Row>
                </Container>
                <Footer />
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

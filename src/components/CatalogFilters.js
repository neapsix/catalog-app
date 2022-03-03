import 'bootstrap/dist/css/bootstrap.min.css'
import './CatalogFilters.css'
import React from 'react'
import {
    Card,
    Form,
} from 'react-bootstrap'

class CatalogFilters extends React.Component {
    render() {
        return this.props.filtersJSON.map((object, index) => {
            const keyString = Object.keys(object)[0]
            return (
                <FilterCard
                    key={keyString}
                    title={keyString}
                    filters={object[keyString]}
                    handleExcludes={this.props.handleExcludes}
                />
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

export default CatalogFilters

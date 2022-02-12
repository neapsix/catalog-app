import './App.css'
import React from 'react'

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

class Container extends React.Component {
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
            <FilterForm
                        filterOptions={this.generateFilterOptions("species")}
                handleExcludes={this.handleExcludes}
                handleIncludeString={this.handleIncludeString}
            />
        )
    }
}

class FilterForm extends React.Component {
    render() {
        return (
            <>
                <FilterFormList
                    filterOptions={this.props.filterOptions}
                    callback={this.props.handleExcludes}
                />
                <FilterFormField callback={this.props.handleIncludeString} />
            </>
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
            <label>
                <input
                    type="checkbox"
                    defaultChecked="true"
                    onChange={this.handleChange}
                />
                {this.props.label}
            </label>
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
            <label>
                Filter:
                <input type="text" onChange={this.handleChange} />
            </label>
        )
    }

    handleChange(event) {
        this.props.callback(event.target.value)

        event.preventDefault()
    }
}

function App() {
    return <Container name="Commands App Container" fields={cols} data={db} />
}

export default App

import 'bootstrap/dist/css/bootstrap.min.css'
import './CatalogTable.css'
import React from 'react'
import {
    Table,
    Modal,
    Button,
} from 'react-bootstrap'

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
                <Table striped bordered hover>
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
                            className="Table-truncate"
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
                    return (
                        <td
                            key={index}
                            className="Table-truncate"
                        >
                                {this.props.object[column.key]}
                        </td>
                    )
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
                <div key={index} className="text-break">
                    <h5>{element}</h5>
                    <p>{this.props.object[element]}</p>
                </div>
            )
        })
    }
}

export default CatalogTable

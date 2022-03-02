import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { Button } from 'react-bootstrap'
import { CSVLink } from 'react-csv'

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
                <Button
                    variant="primary"
                    size="sm"
                    onClick={this.handleClick}
                >
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

export default DownloadCSVButton

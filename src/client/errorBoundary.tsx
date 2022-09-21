// externals
import * as React from "react";

type ErrorBoundaryProps = {};

type ErrorBoundaryState = {
    hasError: boolean;
    errorMessage: string;
    errorStack: string;
};

export class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, errorMessage: "", errorStack: "" };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorMessage: error.message, errorStack: error.stack };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <>
                    <h1>Something went wrong.</h1>
                    <p>
                        <pre>{this.state.errorMessage}</pre>
                    </p>
                    <p>
                        <pre>{this.state.errorStack}</pre>
                    </p>
                </>
            );
        }

        return this.props.children;
    }
}

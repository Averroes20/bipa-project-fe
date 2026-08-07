import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "white", backgroundColor: "#1e1e1e", borderRadius: "8px", margin: "20px", border: "1px solid #ff4444" }}>
          <h2 style={{ color: "#ff4444" }}>React Crash: AnalysisResultView</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#ff8888" }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", marginTop: "10px" }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

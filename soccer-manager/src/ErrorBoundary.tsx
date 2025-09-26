import React from "react";
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err?: any }
> {
  state = { err: undefined as any };
  static getDerivedStateFromError(err: any) {
    return { err };
  }
  componentDidCatch(err: any, info: any) {
    console.error("UI crash", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            padding: 16,
            color: "#fff",
            background: "#111",
            fontFamily: "system-ui",
          }}
        >
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

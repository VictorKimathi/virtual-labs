import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback: (reason: "webgl-unavailable" | "scene-error") => ReactNode;
};

type State = { reason: "webgl-unavailable" | "scene-error" | null };

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { reason: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      reason: /webgl|gpu|graphics context/i.test(error.message)
        ? "webgl-unavailable"
        : "scene-error",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Physics 3D scene failed", error, info.componentStack);
  }

  render() {
    return this.state.reason
      ? this.props.fallback(this.state.reason)
      : this.props.children;
  }
}

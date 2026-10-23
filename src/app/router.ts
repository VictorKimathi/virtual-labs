import { createElement } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RouteErrorPage } from "../shared/errors/RouteErrorPage";
import { AppLayout } from "./AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(AppLayout),
    errorElement: createElement(RouteErrorPage),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("../features/catalog/pages/HomePage"))
            .default,
        }),
      },
      {
        path: "labs",
        lazy: async () => ({
          Component: (await import("../features/catalog/pages/LabBrowserPage"))
            .default,
        }),
      },
      {
        path: "labs/:labId",
        lazy: async () => ({
          Component: (await import("../features/labs/pages/GuidedLabPage"))
            .default,
        }),
      },
      {
        path: "labs/:labId/pre-assessment",
        lazy: async () => ({
          Component: (await import("../features/assessment/pages/QuizPage"))
            .default,
        }),
      },
      {
        path: "workbench",
        lazy: async () => ({
          Component: (
            await import("../features/workbench/pages/WorkbenchTopicsPage")
          ).default,
        }),
      },
      {
        path: "workbench/:topicId",
        lazy: async () => ({
          Component: (
            await import("../features/workbench/pages/TopicBenchPage")
          ).default,
        }),
      },
      {
        path: "sandbox",
        lazy: async () => ({
          Component: (await import("../features/sandbox/pages/SandboxPage"))
            .default,
        }),
      },
      {
        path: "sandbox/biology",
        lazy: async () => ({
          Component: (
            await import("../features/biology-lab/pages/BiologyLabPage")
          ).default,
        }),
      },
      {
        path: "progress",
        lazy: async () => ({
          Component: (await import("../features/progress/pages/ProgressPage"))
            .default,
        }),
      },
      {
        path: "*",
        lazy: async () => ({
          Component: (await import("../shared/ui/NotFoundPage")).default,
        }),
      },
    ],
  },
]);

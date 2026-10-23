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
        path: "labs/:labId/post-assessment",
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
        path: "chemistry/indicators",
        lazy: async () => ({
          Component: (
            await import("../features/chemistry-lab/pages/IndicatorLabPage")
          ).default,
        }),
      },
      {
        path: "chemistry/titration",
        lazy: async () => ({
          Component: (
            await import("../features/chemistry-lab/pages/TitrationLabPage")
          ).default,
        }),
      },
      {
        path: "chemistry/separation",
        lazy: async () => ({
          Component: (
            await import("../features/chemistry-lab/pages/SeparationLabPage")
          ).default,
        }),
      },
      {
        path: "simulations",
        lazy: async () => ({
          Component: (
            await import("../features/phet-simulations/pages/PhetSimulationsPage")
          ).default,
        }),
      },
      {
        path: "simulations/:simName",
        lazy: async () => ({
          Component: (
            await import("../features/phet-simulations/pages/PhetSimulationPage")
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

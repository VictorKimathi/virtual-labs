import { createElement, type ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RouteErrorPage } from "../shared/errors/RouteErrorPage";
import { AppLayout } from "./AppLayout";
import { PortalLayout } from "./PortalLayout";

const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: createElement(RouteErrorPage),
    lazy: page(() => import("../features/catalog/pages/LandingPage")),
  },
  {
    element: createElement(PortalLayout),
    errorElement: createElement(RouteErrorPage),
    children: [
      {
        path: "/login",
        lazy: page(() => import("../features/account/pages/LoginPage")),
      },
      {
        path: "/login/:method",
        lazy: page(() => import("../features/account/pages/LoginMethodPage")),
      },
      {
        path: "/signup",
        lazy: page(() => import("../features/account/pages/SignupPage")),
      },
      {
        path: "/student",
        lazy: page(
          () => import("../features/account/pages/StudentLinkRedirect"),
        ),
      },
      {
        path: "/teacher",
        lazy: async () => ({
          Component: (
            await import("../features/classroom/pages/TeacherDashboardPage")
          ).default,
        }),
      },
      {
        path: "/teacher/classes/:classId",
        lazy: async () => ({
          Component: (
            await import("../features/classroom/pages/TeacherClassPage")
          ).default,
        }),
      },
    ],
  },
  {
    element: createElement(AppLayout),
    errorElement: createElement(RouteErrorPage),
    children: [
      {
        path: "dashboard",
        lazy: page(() => import("../features/account/pages/DashboardPage")),
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
        path: "workbench/chemistry",
        lazy: async () => ({
          Component: (
            await import("../features/chemistry-bench/pages/ChemistryBenchPage")
          ).default,
        }),
      },
      {
        path: "workbench/biology",
        lazy: async () => ({
          Component: (
            await import("../features/biology-bench/pages/BiologyBenchPage")
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
        path: "biology/anatomy",
        lazy: async () => ({
          Component: (await import("../features/biology-lab/pages/AnatomyPage"))
            .default,
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
        path: "falstad",
        lazy: async () => ({
          Component: (
            await import("../features/falstad-simulators/pages/FalstadSimulatorsPage")
          ).default,
        }),
      },
      {
        path: "physicshub",
        lazy: async () => ({
          Component: (
            await import("../features/physicshub-simulations/pages/PhysicshubSimulationsPage")
          ).default,
        }),
      },
      {
        path: "physicshub/:simId",
        lazy: async () => ({
          Component: (
            await import("../features/physicshub-simulations/pages/PhysicshubSimulationPage")
          ).default,
        }),
      },
      {
        path: "schools",
        lazy: async () => ({
          Component: (
            await import("../features/school-subscription/pages/SchoolsPage")
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

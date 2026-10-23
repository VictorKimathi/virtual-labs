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
        path: ":subjectId",
        lazy: async () => ({
          Component: (await import("../features/catalog/pages/SubjectPage"))
            .default,
        }),
      },
      {
        path: ":subjectId/learn/:lessonSlug",
        lazy: async () => ({
          Component: (await import("../features/learning/pages/LessonPage"))
            .default,
        }),
      },
      {
        path: ":subjectId/labs/:labSlug",
        lazy: async () => ({
          Component: (await import("../features/labs/pages/LabIntroPage"))
            .default,
        }),
      },
      {
        path: ":subjectId/labs/:labSlug/run",
        lazy: async () => ({
          Component: (await import("../features/labs/pages/LabRunPage"))
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

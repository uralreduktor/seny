import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { TendersPage } from "@/pages/TendersPage";
import { TenderDetailPage } from "@/pages/TenderDetailPage";
import { TenderCreatePage } from "@/pages/TenderCreatePage";
import { NomenclaturesPage } from "@/pages/NomenclaturesPage";
import { NomenclaturePresetsPage } from "@/pages/NomenclaturePresetsPage";
import { LoginPage } from "@/pages/LoginPage";
import { PrivateRoute } from "@/components/PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <div className="p-8 text-center text-gray-500">Dashboard (UPDATED)</div>,
      },
      {
        path: "tenders",
        element: <TendersPage />,
      },
      {
        path: "tenders/new",
        element: <TenderCreatePage />,
      },
      {
        path: "tenders/:id/edit",
        element: <TenderCreatePage />,
      },
      {
        path: "tenders/:id",
        element: <TenderDetailPage />,
      },
      {
        path: "nomenclatures",
        element: <NomenclaturesPage />,
      },
      {
        path: "nomenclatures/presets",
        element: <NomenclaturePresetsPage />,
      },
    ],
  },
]);

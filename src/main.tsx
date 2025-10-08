import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import ClerkProvider from '@/components/auth/ClerkProvider';
import ClerkAuthWrapper from '@/contexts/ClerkUserContext';
import MainLayout from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { PromptRewriterPage } from '@/pages/PromptRewriterPage';
import { ArtistPage } from '@/pages/ArtistPage';
import { PlaylistPage } from '@/pages/PlaylistPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { SearchPage } from '@/pages/SearchPage';
import { CreateArtistPage } from '@/pages/CreateArtistPage';
import { UserArtistPage } from '@/pages/UserArtistPage';
import SettingsPage from '@/pages/SettingsPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "prompt-rewriter", element: <PromptRewriterPage /> },
      { path: "artist/:id", element: <ArtistPage /> },
      { path: "user-artist/:id", element: <UserArtistPage /> },
      { path: "playlist/:id", element: <PlaylistPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "create-artist", element: <CreateArtistPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sign-up",
    element: <SignUpPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider>
        <ClerkAuthWrapper>
          <RouterProvider router={router} />
        </ClerkAuthWrapper>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
);
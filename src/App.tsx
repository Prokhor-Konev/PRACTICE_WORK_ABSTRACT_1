import React from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';

import { ReactFlowProvider } from '@xyflow/react';

import { EditorPage } from './pages/editor';

const RouterProvider = import.meta.env.MODE === 'production' ? HashRouter : BrowserRouter;

export const AppRouter: React.FC = () => {
    return <RouterProvider>
        <ReactFlowProvider>
            <Routes>
                <Route path="/" element={<EditorPage />} />
            </Routes>
        </ReactFlowProvider>
    </RouterProvider>
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BuilderProvider } from './context/BuilderContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { SavedSitesModal } from './components/saved/SavedSitesModal';
import { BuilderPage } from './pages/BuilderPage';
import { EditorPage } from './pages/EditorPage';
import { LivePreviewPage } from './pages/LivePreviewPage';
import { TemplatesGalleryPage } from './pages/TemplatesGalleryPage';

export function App() {
  return (
    <BuilderProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased">
          {/* Top Global Navigation Bar */}
          <Navbar />

          {/* Main Route Switcher */}
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<BuilderPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/preview" element={<LivePreviewPage />} />
              <Route path="/templates" element={<TemplatesGalleryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Global Floating Modals & Feedback */}
          <SavedSitesModal />
          <Toast />
        </div>
      </BrowserRouter>
    </BuilderProvider>
  );
}

export default App;

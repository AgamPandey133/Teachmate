import { StrictMode } from 'react'
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { SocketContextProvider } from "./context/SocketContext.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
);

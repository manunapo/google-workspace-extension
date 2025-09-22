import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App2 from '../components/App2';
import '../styles.css';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes - how long data is considered fresh
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes - how long inactive data stays in cache
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 2,
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: 'always',
    },
  },
});

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App2 />
  </QueryClientProvider>,
  document.getElementById('index')
);

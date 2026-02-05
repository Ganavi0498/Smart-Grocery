import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

describe('Dashboard Page', () => {
  it('renders dashboard UI', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/dashboard|inventory|grocery|alerts/i)).toBeInTheDocument();
  });
});

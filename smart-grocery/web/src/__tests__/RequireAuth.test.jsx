import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import Dashboard from '../pages/Dashboard';

// Mock AuthContext to simulate no user
jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: null })
}));

describe('Protected Route', () => {
  it('redirects to login if not authenticated', () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      </MemoryRouter>
    );
    // Should not render dashboard, should show login or redirect
    expect(container.innerHTML).toMatch(/login/i);
  });
});

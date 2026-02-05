import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check for a core element, e.g. app title or nav
    expect(screen.getByText(/grocery|dashboard|login/i)).toBeInTheDocument();
  });
});

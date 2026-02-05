import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inventory from '../pages/Inventory';

describe('Inventory Page', () => {
  it('renders inventory UI', () => {
    render(
      <MemoryRouter>
        <Inventory />
      </MemoryRouter>
    );
    expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('can open add item dialog', () => {
    render(
      <MemoryRouter>
        <Inventory />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/add inventory item/i)).toBeInTheDocument();
  });
});

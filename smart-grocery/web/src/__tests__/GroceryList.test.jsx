import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GroceryList from '../pages/GroceryList';

describe('Grocery List Page', () => {
  it('renders grocery list UI', () => {
    render(
      <MemoryRouter>
        <GroceryList />
      </MemoryRouter>
    );
    expect(screen.getByText(/grocery list/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('can open add grocery item dialog', () => {
    render(
      <MemoryRouter>
        <GroceryList />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/add grocery item/i)).toBeInTheDocument();
  });
});

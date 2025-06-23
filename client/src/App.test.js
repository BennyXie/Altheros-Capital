import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app with brand name', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Midwest Health/i);
  expect(brandElements[0]).toBeInTheDocument();
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductList from './index';

describe('ProductList', () => {
  test('renders product name, price and link', () => {
    const products = [
      {
        _id: '1',
        name: 'RMIT Hoodie',
        slug: 'rmit-hoodie',
        description: 'Cozy and red',
        price: 49.99,
        brand: { name: 'RMIT' },
        imageUrl: '/images/products/p-1.jpg',
        totalReviews: 0
      }
    ];

    render(
      <MemoryRouter>
        <ProductList
          products={products}
          updateWishlist={jest.fn()}
          authenticated={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('RMIT Hoodie')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/rmit-hoodie');
  });
});


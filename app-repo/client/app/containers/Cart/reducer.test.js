import reducer from './reducer';
import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  HANDLE_CART_TOTAL,
  CLEAR_CART,
  SET_CART_ID
} from './constants';

describe('cart reducer', () => {
  test('should return initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({
      cartItems: [],
      cartTotal: 0,
      cartId: ''
    });
  });

  test('adds and removes items', () => {
    const item = { _id: 'p1', name: 'RMIT Tee', price: 19.99 };
    const state1 = reducer(undefined, { type: ADD_TO_CART, payload: item });
    expect(state1.cartItems).toHaveLength(1);
    const state2 = reducer(state1, { type: REMOVE_FROM_CART, payload: item });
    expect(state2.cartItems).toHaveLength(0);
  });

  test('handles totals and clearing', () => {
    const withTotal = reducer(undefined, { type: HANDLE_CART_TOTAL, payload: 59.97 });
    expect(withTotal.cartTotal).toBe(59.97);
    const withId = reducer(withTotal, { type: SET_CART_ID, payload: 'cid-123' });
    expect(withId.cartId).toBe('cid-123');
    const cleared = reducer(withId, { type: CLEAR_CART });
    expect(cleared).toEqual({ cartItems: [], cartTotal: 0, cartId: '' });
  });
});


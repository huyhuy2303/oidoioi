const { getStoreProductsQuery } = require('../../utils/queries');

describe('getStoreProductsQuery', () => {
  test('returns pipeline including price and rating filters', () => {
    const pipeline = getStoreProductsQuery(10, 100, 4);
    const matchWithFilters = pipeline.find(
      s => s.$match && s.$match.price && s.$match.averageRating
    );
    expect(matchWithFilters).toBeDefined();
    expect(matchWithFilters.$match).toMatchObject({
      isActive: true,
      price: { $gte: 10, $lte: 100 },
      averageRating: { $gte: 4 }
    });
  });

  test('handles missing min/max/rating gracefully', () => {
    const pipeline = getStoreProductsQuery(undefined, undefined, undefined);
    const matchWithAvg = pipeline.find(s => s.$match && 'averageRating' in s.$match);
    expect(matchWithAvg).toBeDefined();
    expect(matchWithAvg.$match).toHaveProperty('isActive', true);
    expect(matchWithAvg.$match).toHaveProperty('averageRating');
  });
});

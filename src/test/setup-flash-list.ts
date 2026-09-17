// FlashList measures real layout natively, which isn't available under Jest.
// This is the layout-mocking half of @shopify/flash-list's own jestSetup.js;
// its other half (aliasing FlashList to an internal RecyclerView export)
// isn't usable — that export doesn't exist in the installed 2.0.2 build, so
// applying it makes every FlashList render `undefined` instead.
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const actual = jest.requireActual<
    typeof import('@shopify/flash-list/dist/recyclerview/utils/measureLayout')
  >('@shopify/flash-list/dist/recyclerview/utils/measureLayout');
  return {
    ...actual,
    measureParentSize: jest
      .fn()
      .mockReturnValue({ x: 0, y: 0, width: 400, height: 900 }),
    measureFirstChildLayout: jest
      .fn()
      .mockReturnValue({ x: 0, y: 0, width: 400, height: 900 }),
    measureItemLayout: jest
      .fn()
      .mockReturnValue({ x: 0, y: 0, width: 100, height: 100 }),
  };
});

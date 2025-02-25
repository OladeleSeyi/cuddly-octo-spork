// This file is used to set up the test environment
// It's automatically loaded by Jest

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

// Mock the date to ensure consistent tests
const mockDate = new Date("2025-01-01T00:00:00.000Z");
global.Date = class extends Date {
  constructor(date) {
    if (date) {
      return super(date);
    }
    return mockDate;
  }
};

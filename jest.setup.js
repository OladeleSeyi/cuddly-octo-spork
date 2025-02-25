import "@testing-library/jest-dom";

import "./__tests__/setup-test-env.js";

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

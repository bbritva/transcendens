import { createRoot } from 'react-dom/client';
import Protected from '../Authentication/Protected';
import {act} from 'react-dom/test-utils'


let container = null;
let root = null

const localStorageMock = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

beforeEach(() => {
  // подготавливаем DOM-элемент, куда будем рендерить
  container = document.createElement("div");
  root = createRoot(container);
  window.sessionStorage.clear();
  jest.restoreAllMocks();
  document.body.appendChild(container);
});

afterEach(() => {
  // подчищаем после завершения
  window.sessionStorage.clear();
  jest.restoreAllMocks();
  container.remove();
  container = null;
});



  it("should render success login with user", () => {
    let user = {
      id: '1',
      name: 'vasya',
      image: 'no-image',
      avatar: '',
      isTwoFaEnabled: false
    };

    act(() => {
      root.render(
        <Protected
          user={user}
          render={() => <div data-testid="success"></div>}
          fail={() =>
            <div data-testid="fail"></div>
          }
        />
      );
    });

    expect(
      container.querySelector("[data-testid='success']")
    ).toBeTruthy();

    expect(
      container.querySelector('[data-testid="fail"]')
    ).toBeFalsy();

  });

  it("should render success login with user and with mocked username", () => {
    window.sessionStorage.setItem('username', 'vasya')
    let user = {
      id: '1',
      name: 'vasya',
      image: 'no-image',
      avatar: '',
      isTwoFaEnabled: false
    };

    act(() => {
      root.render(
        <Protected
          user={user}
          render={() => <div data-testid="success"></div>}
          fail={() =>
            <div data-testid="fail"></div>
          }
        />
      );
    });

    expect(
      container.querySelector("[data-testid='success']")
    ).toBeTruthy();

    expect(
      container.querySelector('[data-testid="fail"]')
    ).toBeFalsy();

  });

  it("should render success login without user but with mocked storage username", () => {
    window.sessionStorage.setItem('username', 'vasya')
    act(() => {
      root.render(
        <Protected
          user={null}
          render={() => <div data-testid="success"></div>}
          fail={() =>
            <div data-testid="fail"></div>
          }
        />
      );
    });

    expect(
      container.querySelector("[data-testid='success']")
    ).toBeTruthy();

    expect(
      container.querySelector('[data-testid="fail"]')
    ).toBeFalsy();

  });

  it("should render fail login without user", () => {
    act(() => {
      root.render(
        <Protected
          user={null}
          render={() => <div data-testid="success"></div>}
          fail={() =>
            <div data-testid="fail"></div>
          }
        />
      );
    });

    expect(
      container.querySelector("[data-testid='fail']")
    ).toBeTruthy();

    expect(
      container.querySelector('[data-testid="success"]')
    ).toBeFalsy();

  });

import { fireEvent, getByLabelText } from '@testing-library/react';
import { Root, createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils'
import ChooseTwoFA, { twoFAdialogProps } from 'src/components/AccountUpdate/ChooseTwoFA';


let container: HTMLElement;
let root: Root;

beforeEach(() => {
  // подготавливаем DOM-элемент, куда будем рендерить
  container = document.createElement("div");
  root = createRoot(container);
  jest.restoreAllMocks();
  document.body.appendChild(container);
});

afterEach(() => {
  // подчищаем после завершения
  jest.restoreAllMocks();
  if (container)
    container.remove();
});


it("should render twoFA dialog and display user input", () => {
  const enableProps: twoFAdialogProps = {
    title: 'Enable', 
    urlQR: testQR,
    enabledTwoFA: true,
    setEnabledTwoFa: jest.fn(),
    setValue: jest.fn(),
    value: '',
    error: false
  }

  act(() => {
    root.render(
      <ChooseTwoFA 
        {...enableProps}
      />
    );
  });

  const textField = getByLabelText(container, 'otp code') as HTMLInputElement;
  fireEvent.change(textField, {target: {value: '654321'}});
  expect(textField?.value).toBe('654321')

  // expect(
  //   container?.querySelector("[data-testid='success']")
  // ).toBeTruthy();

  // expect(
  //   container?.querySelector('[data-testid="fail"]')
  // ).toBeFalsy();

});

let testQR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAAAklEQVR4AewaftIAAAeMSURBVO3BQY4cSRLAQDLQ//8yV0c/JZCoau0o4Gb2B2td4rDWRQ5rXeSw1kUOa13ksNZFDmtd5LDWRQ5rXeSw1kUOa13ksNZFDmtd5LDWRQ5rXeSw1kV++JDK31QxqUwVk8onKiaVqeINlaniicpUMalMFZPKk4onKn9TxScOa13ksNZFDmtd5Icvq/gmlTdUpopvqphUPqEyVUwVn6iYVD5R8U0q33RY6yKHtS5yWOsiP/wylTcq3qiYVCaVqeKJylTxRsWk8gmVqWKqmFSmit+k8kbFbzqsdZHDWhc5rHWRH/5xKlPFpPJE5Q2VJypTxTepvKEyVUwqU8W/7LDWRQ5rXeSw1kV++MdVvKEyVbxRMalMFZPKk4pJ5UnFpPKkYlK52WGtixzWushhrYv88Msq/iaVT6hMFZPKE5WpYlJ5o+JJxaTypOKbKv5LDmtd5LDWRQ5rXeSHL1P5m1SmikllqphUpopJZaqYVKaKSWWqmFSmikllqphUpopJZaqYVKaKJyr/ZYe1LnJY6yKHtS7yw4cq/mUVk8oTlScqU8Wk8kRlqphUpopJZaqYVN6o+Jcc1rrIYa2LHNa6yA8fUpkqJpUnFZPKGxWTyhOVqeJJxROVb6qYVKaKSeUTFU9UpoonKlPFpPKk4hOHtS5yWOsih7Uu8sOHKiaVJxVvVEwqk8qTiicqb6hMFZ+omFSeqDypmFTeUJkq3qh4o+KbDmtd5LDWRQ5rXcT+4P9IZaqYVL6p4g2VJxWTypOKN1SeVDxRmSreUHlSMak8qfhNh7UucljrIoe1LvLDl6lMFZPKVDGpTBWTyidUpopJZap4ojJVPFGZKp5UTCpPVKaKSeVvqvibDmtd5LDWRQ5rXcT+4AMqU8UTlW+qmFSmik+oTBVPVD5RMak8qZhU3qh4ojJVTCpTxaTyRsUnDmtd5LDWRQ5rXeSHL1N5UvFEZaqYVH6TylQxqXxTxaQyVTxR+SaVb6r4mw5rXeSw1kUOa13E/uAvUpkqJpU3Kt5Q+U0Vk8o3VTxRmSqeqEwVk8obFZPKGxWfOKx1kcNaFzmsdZEfvkxlqpgqJpUnFZ9QmSreUPlNFZPKJyqeqEwVb1RMKk8q/qbDWhc5rHWRw1oX+eFDKlPFJyomlaniicpU8URlqpgqJpU3Kt6oeKLypGJSmSomlScVk8obKlPFbzqsdZHDWhc5rHWRH/7jKp6ovKEyVUwqU8VUMalMKk8qnqhMFU8q3lB5Q+VJxRsqTyo+cVjrIoe1LnJY6yI/fJnKVDGpTBWTyicqJpWpYlL5RMUbKk8qJpUnKlPFVPFE5UnFpPJEZaqYVH7TYa2LHNa6yGGti9gffEDlmyqeqEwVb6hMFZPKk4onKm9UvKHypGJSeaNiUpkqJpU3KiaVqeITh7UucljrIoe1LvLDhyomlaliUpkqJpUnFW+ofKLiicqTiknlicpUMVVMKm9UPFGZKt6oeKLymw5rXeSw1kUOa13kh/8zlaniicqTijdUpopPVEwqT1TeUJkqPqHyiYpJZap4UvFNh7UucljrIoe1LvLDl1VMKlPFpPJE5Q2VJxVvqEwVn6h4ovIJlTcqJpU3VD6hMlV84rDWRQ5rXeSw1kV++JDKk4onFU8qnqg8qXhD5Y2KSWWqmFSeVPw/VUwqn1CZKn7TYa2LHNa6yGGti/zwZRVPVKaKJypTxVTxRGWqmFSmiicqU8VUMalMFZPKb6qYVJ5UTBWTylTxRGVSmSq+6bDWRQ5rXeSw1kV++FDFb6qYVN6oeEPlEypPVN5QmSqeVLxR8URlqphUnlRMKpPKVPGJw1oXOax1kcNaF/nhy1S+SeUTKlPFGxVPVKaKN1QmlaliUvkmlScVk8o3VXzTYa2LHNa6yGGti9gffEBlqphUpopJZap4ojJVTCpTxaTyX1IxqXyiYlJ5o2JSmSomlScVT1Smik8c1rrIYa2LHNa6iP3BL1J5UjGpvFHxTSpTxRsqU8UTlScVk8obFU9U/qaK33RY6yKHtS5yWOsiP/yyijcq3lCZKiaVqeINlaliUvmmijcqJpUnKk8q3lB5Q+VJxScOa13ksNZFDmtd5IcPqfxNFU9Unqg8qZhUnlRMKp9QmSqmik9UTCpPVKaKJxVPVKaKbzqsdZHDWhc5rHWRH76s4ptUPlExqfymiicq36QyVUwqn6h4Q2Wq+JsOa13ksNZFDmtd5IdfpvJGxRsVk8qTiicqU8Wk8kbFJ1SmijcqnqhMKv+yw1oXOax1kcNaF/nhH6cyVUwqTyqmiicVb6g8qXiiMqk8UXlS8YmKSeWNit90WOsih7UucljrIj+sV1SeVEwVT1TeqHiiMlVMKp9QeVIxqTyp+KbDWhc5rHWRw1oX+eGXVfymijcqJpWpYlKZKiaVJypTxZOKN1Q+UfFE5UnFGxW/6bDWRQ5rXeSw1kV++DKVv0llqnii8kbFk4rfpDJVvKHyhsonVKaKSeVJxScOa13ksNZFDmtdxP5grUsc1rrIYa2LHNa6yGGtixzWushhrYsc1rrIYa2LHNa6yGGtixzWushhrYsc1rrIYa2LHNa6yP8A/cbYqRDeRk0AAAAASUVORK5CYII='
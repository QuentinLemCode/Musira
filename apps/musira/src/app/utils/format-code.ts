export const codeToString = (code: number) =>
  `${code.toString().substring(0, 3)}-${code.toString().substring(3, 6)}-${code
    .toString()
    .substring(6, 9)}`;

export const stringToCode = (code: string) =>
  Number.parseInt(code.replaceAll('-', ''), 10);

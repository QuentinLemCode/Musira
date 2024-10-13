import { Subject } from 'rxjs';

export const mockObservable = <T = unknown>(fun: jest.Mock) => {
  const subject = new Subject<T>();
  fun.mockReturnValue(subject.asObservable());
  return subject;
};

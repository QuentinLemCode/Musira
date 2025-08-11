import { Subject } from 'rxjs';

export const mockObservable = <T = unknown>(fun: jasmine.Spy) => {
  const subject = new Subject<T>();
  fun.and.returnValue(subject.asObservable());
  return subject;
};

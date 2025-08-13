import { Subject } from 'rxjs';

export type SpyLike = { and: { returnValue: (v: unknown) => void } };

export const mockObservable = <T = unknown>(fun: SpyLike) => {
  const subject = new Subject<T>();
  fun.and.returnValue(subject.asObservable());
  return subject;
};

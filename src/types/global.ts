export type Maybe<T> = T | null | undefined;
export type VoidFunction = () => void;
export type ValueFunction<T, R = void> = (args: T) => R;
export type TupleFunction<P1, P2, R = void> = (first: P1, second: P2) => R;
export class Promiser<T> {
    private _promise: Promise<T>;
    private _resolve: (value?: T) => void = () => {};
    private _reject: (reason?: any) => void = () => {};
    constructor() {
        this._promise = new Promise((res, rej) => {
            this._resolve = res;
            this._reject = rej;
        });
    }

    public get promise() {
        return this._promise;
    }

    public get resolve() {
        return this._resolve;
    }

    public get reject() {
        return this._reject;
    }
}
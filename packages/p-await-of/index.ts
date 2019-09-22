export function of<T,E= Error> (promise: Promise<T>): Promise<[T?,E?]> {
    return Promise.resolve(promise).then(v => [v], err => [undefined, err || new Error(`Reject with ${err}`)])
}

export default of

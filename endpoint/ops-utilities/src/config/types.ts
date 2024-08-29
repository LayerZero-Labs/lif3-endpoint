export interface ConfigureManager {
    /**
     * return the value of query path
     * @param path property name or index, or fallbacks if it is an array
     */
    get(...path: (string | number | (string | number)[])[]): Promise<any>
}

type getConfigFunc = (...path: (string | number | (string | number)[])[]) => any
export { getConfigFunc }

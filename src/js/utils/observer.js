export const createObserver = ({ threshold = 0, rootMargin = '0px', callback }) => {
    return new IntersectionObserver(
        (entries) => {
            entries.forEach(callback)
        },
        {
            threshold,
            rootMargin
        }
    )
}

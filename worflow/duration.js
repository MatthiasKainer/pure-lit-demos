export const hours = (value) => {
    const now = new Date()
    now.setHours(now.getHours() + value)
    return now
}
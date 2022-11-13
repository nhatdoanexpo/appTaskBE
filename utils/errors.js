const createError = (success,message) => {
    return {
        success : success,
        message : message
    }
}
module.exports = createError;
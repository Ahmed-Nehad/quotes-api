export const generateApiKey = () => {
    let key = '';
    const length = 22;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++)
        key += characters.charAt( Math.floor( Math.random() * charactersLength ) );
    return key
}
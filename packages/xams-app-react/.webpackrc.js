module.exports = ({assign}, webpack) => {
    console.log('override');
    return assign(webpack, {
        devServer:{
            quiet: true,
        }
    });
};

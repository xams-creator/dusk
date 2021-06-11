module.exports = ({merge}, webpack) => {
    console.log('override');
    return merge(webpack, {
        // output: {
        //     path: 'S:\\xams\\xams-framework-frontend\\packages\\xams-app-react\\dist',
        //     filename: 'static/js/[name].bundle.js',
        //     chunkFilename: 'static/js/[name].bundle.chunk.js',
        // },
        devServer: {
            quiet: true,
            // writeToDisk: true
        }
    });
};

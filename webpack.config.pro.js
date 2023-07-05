const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');
module.exports = {
    mode:"production",
    entry: './src/app.ts',
    output:{
        filename:'bundle.js',
        path:path.resolve(__dirname,'dist'),
    },
    devtool:'nosources-source-map',
    module:{
        rules:[
            {
                test:/\.ts$/,
                use:'ts-loader',
                exclude: /node-modules/
            }
        ]
    },
    resolve:{
        extensions:['.ts','.js']
    },
    plugins: [
        new CleanPlugin.CleanWebpackPlugin()
    ],
    devServer: {
        port: 8081, // 사용할 포트 번호 설정
    },
}
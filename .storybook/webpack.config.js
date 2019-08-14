const path = require('path');
const autoprefixer = require('autoprefixer');

// const { jsonRegexStringify } = require('./configWriter');
const { isRegex, regexToString } = require('./configWriter');

const regexToStringOrOtherToNull = (val) => {
    return isRegex(val) ? regexToString(val) : null;
};

module.exports = ({ config, mode }) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        options: {
            presets: [['react-app', { flow: false, typescript: true }]],
        },
    });

    const regexCssTestValue = /\.css$/;
    const regexSvgTestValue = /\.svg$/;
    const newRulesList = [];
    config.module.rules.forEach(
        item => {
            const regexStr = regexToStringOrOtherToNull(item.test);
            if (item.test.test('.css') /* regexStr === regexToStringOrOtherToNull(regexCssTestValue) */) {
                console.log('INFO: removing CSS module rule so we can replace it with our own');
            }
            else if (item.test.test('.svg') /* regexStr.indexOf('svg') >= 0 */) {
                if (regexStr !== "/\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani)(\?.*)?$/") {
                    console.log('INFO: modifying SVG related module rule to exclude SVG because it will be handled separately');
                    item.test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani)(\?.*)?$/;
                }
                else {
                    // NOTE: If it goes here then you'll probably have to modify the regexes above as appropriate
                    //       to exclude svg but include everything else.
                    console.log('WARNING: removing SVG related module rule altogether');
                    console.log(`  (regex match was: ${regexStr} - looks like a newer version of the regex maybe?!?)`);
                }
            }
            else {
                console.log(`INFO: not removing module rule - ${regexStr}`);
                newRulesList.push(item);
            }
        }
    );
    config.module.rules = newRulesList;
    config.module.rules.push({
        test: regexCssTestValue,
        use: [
            {
                loader: "style-loader"
            },
            {
                loader: "css-loader",
                options: {
                    importLoaders: 1,
                    modules: {
                        localIdentName: "[name]__[local]__[hash:base64:5]"
                    }
                }
            }
        ],
        include: path.resolve(__dirname, "../")
    });
    config.module.rules.push({
        test: regexSvgTestValue,
        use: [
            {
                loader: '@svgr/webpack',
                options: {
                    svgoConfig: {
                        plugins: {
                            removeViewBox: false
                        }
                    }
                }
            },
            'url-loader'
        ]
    });

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
};
var css = require('css')

exports = module.exports = legacy;

var mediaQueryPattern = /min\-width:\s*(\d+)/;

function findLegacyRules(rules, minWidth) {
    return rules.reduce(function(rules, rule) {
        var media = rule.media

        if (media) {
            var matches = mediaQueryPattern.exec(media)

            if (matches && +matches[1] <= minWidth) {
                return rules.concat(rule.rules)
            }
        }

        return rules
    }, [])
}

function legacy(str, minWidth) {
    var ast = css.parse(str),
        rules = findLegacyRules(ast.stylesheet.rules, minWidth)

    ast.stylesheet.rules = rules

    return css.stringify(ast)
}

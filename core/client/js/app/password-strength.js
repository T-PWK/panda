(function () {
    "use strict";

    var module = angular.module('password', []),
        checks = [
            /* alphaLower */ {
                re: /[a-z]/,
                score: 1
            },
            /* alphaUpper */ {
                re: /[A-Z]/,
                score: 5
            },
            /* mixture of upper and lowercase */ {
                re: /([a-z].*[A-Z])|([A-Z].*[a-z])/,
                score: 2
            },
            /* threeNumbers */ {
                re: /(.*[0-9].*[0-9].*[0-9])/,
                score: 7
            },
            /* special chars */ {
                re: /.[!@#$%^&*?_~]/,
                score: 5
            },
            /* multiple special chars */ {
                re: /(.*[!@#$%^&*?_~].*[!@#$%^&*?_~])/,
                score: 7
            },
            /* all together now, does it look nice? */ {
                re: /([a-zA-Z0-9].*[!@#$%^&*?_~])|([!@#$%^&*?_~].*[a-zA-Z0-9])/,
                score: 3
            },
            /* password of a single char sucks */ {
                re: /(.)\1+$/,
                score: 2
            }
        ],
        scores = [ 0, 10, 15, 25, 45 ],
        verdicts = [ 'Too Short', 'Very weak', 'Weak', 'Good', 'Strong', 'Very strong'],
        progress = [ '0%', '10%', '30%', '60%', '80%', '100%' ];

    module.factory('Password', function () {
        return {
            checkStrength: function (password) {
                var score = 0, minChars = 6, len = password.length, diff = len - minChars, idx = -1;

                // Calculate initial score based on password length
                (diff < 0 && (score -= 100)) || (diff >= 5 && (score += 18)) || (diff >= 3 && (score +=
                    12)) || (diff === 2 && (score += 6));

                angular.forEach(checks, function (check) {
                    password.match(check.re) && (score += check.score);
                });

                // Score bonus for length per character
                score && (score += len);

                angular.forEach(scores, function (value, index) {
                    (idx < 0) && (score < value) && (idx = index);
                });

                return {
                    score:score,
                    verdict: verdicts[idx],
                    progress: progress[idx]
                };
            }
        };
    });

}());
(function () {
    'use strict';

    var bind = angular.bind;

    function linePrefix (value, cm) {
        var cur = cm.getCursor(), line = cm.getLine(cur.line);
        cm.setLine(cur.line, value + line);
        cm.setCursor(cur.line, cur.ch + value.length);
    }

    function replaceSelection(format, cm) {
        var selection = cm.getSelection();
        if (!selection) return;

        cm.replaceSelection(format.replace('$$', selection));
    }

    CodeMirror.commands.h1 = bind(null, linePrefix, '# ');
    CodeMirror.commands.h2 = bind(null, linePrefix, '## ');
    CodeMirror.commands.h3 = bind(null, linePrefix, '### ');
    CodeMirror.commands.h4 = bind(null, linePrefix, '#### ');
    CodeMirror.commands.h5 = bind(null, linePrefix, '##### ');
    CodeMirror.commands.h6 = bind(null, linePrefix, '###### ');
    CodeMirror.commands.blockquote = bind(null, linePrefix, '> ');
    CodeMirror.commands.bold = bind(null, replaceSelection, '**$$**');
    CodeMirror.commands.strike = bind(null, replaceSelection, "~~$$~~");
    CodeMirror.commands.italic = bind(null, replaceSelection, '*$$*');
    CodeMirror.commands.code = bind(null, replaceSelection, '`$$`');
    CodeMirror.commands.link = bind(null, replaceSelection, '[$$](http://)');
    CodeMirror.commands.image = bind(null, replaceSelection, '![$$](http://)');

    CodeMirror.keyMap.pcDefault['Ctrl-K']= 'code';
    CodeMirror.keyMap.macDefault['Ctrl-K']= 'code';

})();
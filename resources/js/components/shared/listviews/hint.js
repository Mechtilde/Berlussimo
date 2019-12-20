/**
 *  Copyright (c) 2019 GraphQL Contributors
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import CodeMirror from 'codemirror';
import {getAutocompleteSuggestions} from 'graphql-language-service-interface';

/**
 * Registers a "hint" helper for CodeMirror.
 *
 * Using CodeMirror's "hint" addon: https://codemirror.net/demo/complete.html
 * Given an editor, this helper will take the token at the cursor and return a
 * list of suggested tokens.
 *
 * Options:
 *
 *   - schema: GraphQLSchema provides the hinter with positionally relevant info
 *
 * Additional Events:
 *
 *   - hasCompletion (codemirror, data, token) - signaled when the hinter has a
 *     new list of completion suggestions.
 *
 */
CodeMirror.registerHelper('hint', 'graphql', (editor, options) => {
    const schema = options.schema;
    if (!schema) {
        return;
    }

    let value = editor.getValue();
    if (options.appendFragments) {
        value += "\n" + options.appendFragments;
    }

    const cur = editor.getCursor();
    let token = editor.getTokenAt(cur);
    if (token.state.kind === 'FragmentSpread' && token.state.step !== 1 && token.type === 'ws') {
        outer:
            for (let l = cur.line; l > 0; l--) {
                let lineTokens = editor.getLineTokens(l);
                for (let i = lineTokens.length - 1; i >= 0; i--) {
                    if (lineTokens[i].state.kind === "SelectionSet") {
                        token = lineTokens[i];
                        break outer;
                    }
                }
            }
    }
    const rawResults = getAutocompleteSuggestions(
        schema,
        value,
        cur,
        token,
    );
    /**
     * GraphQL language service responds to the autocompletion request with
     * a different format:
     * type CompletionItem = {
     *   label: string,
     *   kind?: number,
     *   detail?: string,
     *   documentation?: string,
     *   // GraphQL Deprecation information
     *   isDeprecated?: ?string,
     *   deprecationReason?: ?string,
     * };
     *
     * Switch to codemirror-compliant format before returning results.
     */
    const tokenStart =
        token.type !== null && /"|\w/.test(token.string[0])
            ? token.start
            : token.end;
    const results = {
        list: rawResults.map(item => ({
            text: item.label,
            type: item.detail,
            description: item.documentation,
            isDeprecated: item.isDeprecated,
            deprecationReason: item.deprecationReason,
        })),
        from: {line: cur.line, column: tokenStart},
        to: {line: cur.line, column: token.end},
    };

    if (results && results.list && results.list.length > 0) {
        results.from = CodeMirror.Pos(results.from.line, results.from.column);
        results.to = CodeMirror.Pos(results.to.line, results.to.column);
        CodeMirror.signal(editor, 'hasCompletion', editor, results, token);
    }

    return results;
});
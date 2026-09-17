URL checked: https://brindaml.github.io
When: 2026-09-16, 9:38pm MST
What would have made this fail: If library.js or library-data.js had been left with the wrong filename or an absolute path (like /library.js) after I renamed the old index.html to shadow-or-purified.html, the fetch for those files would have 404'd and the shelf and timeline views would render empty even though the page itself loaded.

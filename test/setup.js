import postcss from 'postcss'
import fs from 'fs'

export function compareFixtures(name, msg, opts, postcssOpts, plugin) {
    it(msg, () => {
        opts = opts || {};
        const pcss = postcss();

        if (plugin) {
            pcss.use(plugin());
        }

        pcss.use(url(opts));
        const actual = pcss.process(read(`fixtures/${name}`), postcssOpts).css;
        const expected = read(`fixtures/${name}.expected`);

        // handy thing: checkout actual in the *.actual.css file
        fs.writeFile(`test/fixtures/${name}.actual.css`, actual);

        assert.equal(actual, expected);
    });
}

export function read(name) {
    return fs.readFileSync(`test/${name}.css`, 'utf8').trim();
}

export function processedCss(fixtures, urlOpts, postcssOpts) {
    return postcss()
    .use(url(urlOpts))
    .process(read(fixtures), postcssOpts)
        .css;
}

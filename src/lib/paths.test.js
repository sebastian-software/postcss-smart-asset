const path = require('path');

const paths = require('./paths');

describe('paths', () => {
    test('should ignore some urls', () => {
        const isUrlShouldBeIgnored = (url) =>
            paths.isUrlShouldBeIgnored(url, {});

        expect([
            '#hash',
            '%23encodedHash',
            '/absoluteUrl',
            'data:someDataInlined',
            'https://somecdnpath.com/asset.png'
        ].every(isUrlShouldBeIgnored)).toBeTruthy();
    });

    test('should\'t ignore absolute urls if have basePath', () => {
        expect(paths.isUrlShouldBeIgnored('/absoluteUrl', {
            basePath: ['/path']
        })).toBeFalsy();
    });

    describe('assets paths', () => {
        const baseDir = path.resolve('/user/project');

        test('should calc assets path', () => {
            expect(
                paths.getAssetsPath(baseDir, 'images', 'imported')
            ).toBe(
                path.resolve('/user/project/images/imported')
            );
        });

        test('should calc assets path with absolute assetsPath param', () => {
            expect(
                paths.getAssetsPath(baseDir, '/user/assets/', 'imported')
            ).toBe(
                path.resolve('/user/assets/imported')
            );
        });

        test('should calc assets path without assetsPath param', () => {
            expect(
                paths.getAssetsPath(baseDir, null, 'imported')
            ).toBe(
                path.resolve('/user/project/imported')
            );
        });
    });

    test('should return assets output base dir', () => {
        const dir = {
            from: '/user/project/css',
            to: '/user/project/build'
        };

        expect(
            paths.getTargetDir(dir)
        ).toBe(
            dir.to
        );
        expect(
            paths.getTargetDir({ from: '/project', to: '/project' })
        ).toBe(
            process.cwd()
        );
    });

    test('should return decl file dir', () => {
        const decl = {
            source: { input: { file: '/project/styles/style.css' } }
        };

        expect(paths.getDirDeclFile(decl)).toBe('/project/styles');
        expect(paths.getDirDeclFile({})).toBe(process.cwd());
    });

    describe('calc path by basePath', () => {
        const basePath = path.resolve('/project/node_modules');
        const dirFrom = path.resolve('/project/styles');

        test('absolute basePath', () => {
            expect(
                paths.getPathByBasePath(basePath, dirFrom, './img/image.png')
            ).toEqual(
                [path.resolve('/project/node_modules/img/image.png')]
            );
        });

        test('relative basePath', () => {
            expect(
                paths.getPathByBasePath('../base-path', dirFrom, './img/image.png')
            ).toEqual(
                [path.resolve('/project/base-path/img/image.png')]
            );
        });

        test('absolute assetUrl', () => {
            expect(
                paths.getPathByBasePath(basePath, dirFrom, '/img/image.png')
            ).toEqual(
                [path.resolve('/project/node_modules/img/image.png')]
            );
        });

        test('multiple basePath', () => {
            expect(
                paths.getPathByBasePath(
                    [basePath, '/some_base_path'],
                    dirFrom,
                    '/img/image.png'
                )
            ).toEqual(
                [
                    path.resolve('/project/node_modules/img/image.png'),
                    path.resolve('/some_base_path/img/image.png')
                ]
            );
        });
    });

    test('should prepare asset data from url and dirs', () => {
        const assetUrl = './sprite/some-image.png?test=1#23';
        const dirs = {
            from: '/project/css',
            file: '/project/css/imported'
        };

        const asset = paths.prepareAsset(assetUrl, dirs);

        // normalizing path for windows
        asset.relativePath = paths.normalize(asset.relativePath);

        expect(asset).toEqual({
            url: './sprite/some-image.png?test=1#23',
            originUrl: './sprite/some-image.png?test=1#23',
            pathname: './sprite/some-image.png',
            absolutePath: path.resolve('/project/css/imported/sprite/some-image.png'),
            relativePath: 'imported/sprite/some-image.png',
            search: '?test=1',
            hash: '#23'
        });
    });

    test('should prepare custom assets', () => {
        const dirs = {
            from: '/project/css',
            file: '/project/css/imported'
        };
        const decl = {
            source: { input: { file: '/project/styles/style.css' } }
        };

        const checkCustomAsset = (assetUrl) => {
            const asset = paths.prepareAsset(assetUrl, dirs, decl);

            expect(asset.absolutePath).toEqual('/project/styles/style.css');
            expect(paths.normalize(asset.relativePath)).toEqual('../styles/style.css');
        };

        ['#hash', '%23ecodedhash', 'data:'].forEach(checkCustomAsset);
    });
});

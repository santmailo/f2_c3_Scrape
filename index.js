const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


async function scrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://github.com/trending/javascript?since=daily');
    const html = await page.content();
    const $ = cheerio.load(html);
    const repos = $('article.Box-row');

    const result = {repositories: [], developers: []};

    // Scrape repositories
    repos.each((i, repo) => {
        const repoTitle = $(repo).find('h1 a').text().trim();
        const repoDesc = $(repo).find('p').text().trim();
        const repoUrl = `https://github.com${$(repo).find('h1 a').attr('href')}`;
        const stars = $(repo).find('a.Link--muted:nth-child(2)').text().trim();
        const forks = $(repo).find('a.Link--muted:nth-child(3)').text().trim();
        const lang = $(repo).find('span[itemprop="programmingLanguage"]').text().trim();

        result.repositories.push({
            title: repoTitle,
            description: repoDesc,
            url: repoUrl,
            stars: stars,
            forks: forks,
            language: lang
        });
    });

    // Scrape developers
    await page.click('a[href="/trending/developers"]');
    await page.waitForSelector('.position-relative');
    const devHtml = await page.content();
    const $dev = cheerio.load(devHtml);
    const devs = $dev('article.Box-row');

    devs.each((i, dev) => {
        const devName = $(dev).find('h1 a').text().trim();
        const devUserName = $(dev).find('span.css-truncate-target').text().trim();
        const devRepo = $(dev).find('p a').text().trim();
        const devRepoDesc = $(dev).find('p span.color-text-secondary').text().trim();

        result.developers.push({
            name: devName,
            username: devUserName,
            repository: devRepo,
            description: devRepoDesc
        });
    });

    await browser.close();

    console.log(JSON.stringify(result, null, 2));
}

scrape();

const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const puppeteer = require('puppeteer-extra')

const pluginStealth = require('puppeteer-extra-plugin-stealth')
const { executablePath } = require('puppeteer')

async function processController(url) {
    console.log("Starting the process to fetch the Doodstream CDN link...");
    
    const session = axios.create({
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false  
        }),
        // headers: {
        //     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //     "Accept-Encoding": "gzip, deflate, br, zstd",
        //     "Referer": "https://dood.li/",
        //     "User-Agent": "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36"
        // }
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://dood.li/"
          }
    });

    const fileCode = extractFileCode(url);
    console.log(fileCode)
    if (!fileCode) {
        console.error("Error: Can't find the file code in the URL.");
        console.error(`Are you sure ${url} is correct?`);
        return null;
    }

    const doodstreamUrl = `https://dood.li/e/${fileCode}`;
    console.log(`File code extracted: ${fileCode}`);
    console.log(`Constructed Doodstream URL: ${doodstreamUrl}`);

    try {
        console.log("ini "+ doodstreamUrl);
        // const response = await session.get({url: doodstreamUrl, "rejectUnauthorized": false});
        const response = await session.get(doodstreamUrl);
        if (response.status === 200) {
            console.log("Successfully fetched the Doodstream page.");
            console.log(response.data);
            const match = response.data.match(/\$.get\('([^']+)',\s*function\(data\)/);
            

            if (response.data.includes('captcha-player')) {
                console.log('Captcha detected! Taking action...');
                getHtmlThoughCloudflare(doodstreamUrl);
              } else {
                console.log('No CAPTCHA, processing data...');
                if (match) {
                    const urlInsideGet = match[1];
                    console.log(`URL found inside the response: ${urlInsideGet}`);
                    
                    const lastValueMatch = urlInsideGet.match(/\/([^/]+)$/);
                    if (!lastValueMatch) {
                        console.error("Error: Unable to extract token from URL.");
                        return null;
                    }
                    const token = lastValueMatch[1];
                    const secondUrl = `https://dood.li${urlInsideGet}`;
                    console.log(`Constructed URL for second request: ${secondUrl}`);
                    
                    const secondResponse = await session.get(secondUrl);
                    if (secondResponse.status === 200) {
                        console.log("Successfully fetched the secondary URL contents.");
                        
                        const part1 = secondResponse.data;
                        console.log("ini part 1");
                        console.log(part1);
                        
                        const randomString = generateRandomString();
                        const expiry = Date.now();
                        const part2 = `${randomString}?token=${token}&expiry=${expiry}`;
                        const finalUrl = `${part1}${part2}`;
                        
                        console.log(`Generated random string: ${randomString}`);
                        console.log(`Token: ${token}`);
                        console.log(`Expiry timestamp: ${expiry}`);
                        console.log(`Doodstream CDN link generated: ${finalUrl}`);
                        return finalUrl;
                    } else {
                        console.error("Error: Unable to fetch the contents of the secondary URL.");
                    }
                } else {
                    console.error("Error: Unable to find the required URL inside the initial response.");
                }
            }
            
        } else {
            console.error("Error: Unable to fetch the Doodstream page. HTTP status code:", response.status);
        }
    } catch (error) {
        console.error("Error during request:", error.message);
    }
    return null;
}

function extractFileCode(url) {
    console.log(url)
    const match = url.match(/.*\/(.*)/);
    return match ? match[1] : null;
}

function generateRandomString(length = 10) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}


const getHtmlThoughCloudflare = async (url) => {
    //puppeteer.use(pluginStealth())
    const result = await puppeteer
      .launch({ 
        ignoreHTTPSErrors: true,
        headless: true,
        executablePath: '/opt/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      .then(async (browser) => {
        const page = await browser.newPage()
        await page.goto(url)
        const html = await page.content()
        await browser.close()
        return html
      })
  
    console.log(` HTML: ${result}`)
    return result // html
  }

module.exports = { processController }

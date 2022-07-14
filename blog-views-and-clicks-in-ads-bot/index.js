import { chromium } from 'playwright'

const urlPrincipalPage = 'https://damianzg.blogspot.com/'

async function getHrefsPost(pageUrl) {
  const browser = await chromium.launch({
    headless: false,
    timeout: 120000,
  })
  const page = await browser.newPage()
  await page.goto(pageUrl)
  const titlesPost = await page.$$('.post-title.entry-title')
  const hrefsObjects = titlesPost.map(async (title) => {
    const aTag = await title.$$('a')
    const href = await (await aTag[0].getProperty('href')).jsonValue()
    return href
  })
  const hrefsText = await Promise.all(hrefsObjects)
  await browser.close()
  return hrefsText
}

async function resolveAdsPrincipalPage() {
  const browser = await chromium.launch({
    headless: false,
    timeout: 120000,
  })
  const page = await browser.newPage()
  await page.goto(urlPrincipalPage)
  const firstTopAd = await page.$(
    '.container-ba33563a47996c7fe2bad5c2239c3def__link'
  )
  await firstTopAd.click()
  await browser.close()
}

module.exports = async function (context, myTimer) {
  var timeStamp = new Date().toISOString()

  await resolveAdsPrincipalPage().then(() =>
    context.log(
      'Ads visited and clicked first ad on top part in principal page'
    )
  )
  const hrefPostsPages = await getHrefsPost(urlPrincipalPage)

  hrefPostsPages.length > 0 && context.log('Hrefs did getted of posts in blog')
  let numPost = 0
  for (let href of hrefPostsPages) {
    const browser = await chromium.launch({
      headless: false,
      timeout: 240000,
    })
    const page = await browser.newPage()
    await page.goto(href)
    context.log(`Post ${numPost + 1} visited - ${href}`, timeStamp)
    const bottomAd = await page.$(
      '.container-ba33563a47996c7fe2bad5c2239c3def__link'
    )
    await bottomAd.click().then(() => {
      context.log(`Ads viewed and click in ad of bottom zone`, timeStamp)
    })
    numPost++
    await browser.close()
    if (numPost == hrefPostsPages.length) {
      context.log('All posts visited', timeStamp)
    }
  }
  context.log('JavaScript timer trigger function ran!', timeStamp)
}

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
  hrefsText.length > 0 && console.log('Hrefs did getted of posts in blog')
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
  console.log('Ads visited and clicked first ad on top part in principal page')
  await browser.close()
}

;(async () => {
  await resolveAdsPrincipalPage()
  const hrefPostsPages = await getHrefsPost(urlPrincipalPage)
  let numPost = 0
  for (let href of hrefPostsPages) {
    const browser = await chromium.launch({
      headless: false,
      timeout: 240000,
    })
    const page = await browser.newPage()
    await page.goto(href)
    console.log(`Post ${numPost + 1} visited - ${href}`)
    const bottomAd = await page.$(
      '.container-ba33563a47996c7fe2bad5c2239c3def__link'
    )
    await bottomAd.click().then(() => {
      console.log(`Ads viewed and click in ad of bottom zone`)
    })
    numPost++
    await browser.close()
    if (numPost == hrefPostsPages.length) {
      console.log('All posts visited')
    }
  }
})()

const puppeteer = require('puppeteer')

const getPageMetrics = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page._client.send('Performance.enable')
  await page.waitFor(1000)
  await page._client.send('Network.emulateNetworkConditions', {
    // 3G Slow
    offline: false,
    latency: 200, // ms
    downloadThroughput: 780 * 1024 / 8, // 780 kb/s
    uploadThroughput: 330 * 1024 / 8 // 330 kb/s
  })

  const tic = Date.now()
  await page.goto('https://www.google.com/', { waitUntil: 'networkidle0' })
  console.log(`page load took: ${Date.now() - tic}ms`)

  const perf = await page.evaluate(_ => {
    return {
      firstPaint:
        chrome.loadTimes().firstPaintTime * 1000 -
        performance.timing.navigationStart,
      loadTimes: chrome.loadTimes(),
      performance: JSON.stringify(performance.timing),
      loadTime:
        performance.timing.loadEventEnd - performance.timing.navigationStart
    }
  })

  console.log(`First paint in ${perf.firstPaint}ms`)
  console.log(perf.loadTime)
  console.log(`${JSON.stringify(perf.loadTimes, null, 4)}`)
  console.log(JSON.parse(perf.performance))
  await browser.close()
}

getPageMetrics()

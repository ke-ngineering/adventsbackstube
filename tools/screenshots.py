import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':800},device_scale_factor=2)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file://'+__import__('pathlib').Path(__file__).resolve().parent.parent.joinpath('index.html').as_posix()+'')
        await pg.wait_for_timeout(800)
        await pg.click('.jar[data-i="0"]')
        await pg.screenshot(path='/tmp/l1.png')
        await pg.evaluate("localStorage.setItem('adventsbackstube.v1',JSON.stringify({level:22,best:{}}))")
        await pg.reload(); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/tmp/l22.png')
        await pg.emulate_media(color_scheme='dark'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/tmp/dark.png')
        print('errors',errs)
        await b.close()
asyncio.run(main())

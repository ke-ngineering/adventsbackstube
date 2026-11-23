import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(__import__('pathlib').Path(__file__).resolve().parent.parent.joinpath('index.html').as_uri() + '#test'); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/tmp/h.png')
        await pg.click('.station[data-g="blech"]'); await pg.wait_for_timeout(300)
        for i in range(6): await pg.click('#next')
        await pg.wait_for_timeout(200)
        await pg.click('.cell[data-i="7"]'); await pg.wait_for_timeout(120)
        await pg.screenshot(path='/tmp/b.png')
        await pg.click('#hint'); await pg.wait_for_timeout(300)
        await pg.click('#back'); await pg.click('.station[data-g="buch"]'); await pg.wait_for_timeout(300)
        for i in range(3): await pg.click('#next')
        await pg.click('#play'); await pg.wait_for_timeout(900)
        await pg.screenshot(path='/tmp/k.png')
        await pg.click('#back'); await pg.click('.station[data-g="regal"]'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/r.png')
        # reload resumes last game
        await pg.reload(); await pg.wait_for_timeout(400)
        print('after reload sub:', await pg.text_content('#sub'))
        await pg.emulate_media(color_scheme='dark'); await pg.click('#back'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/tmp/hd.png')
        print('errors',errs)
        await b.close()
asyncio.run(main())

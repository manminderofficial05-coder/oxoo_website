from playwright.sync_api import sync_playwright
BASE="http://localhost:3100"
with sync_playwright() as p:
    b=p.chromium.launch()
    # exact confirm check
    pg=b.new_context(viewport={"width":1440,"height":900}).new_page(); pg.on("dialog", lambda d: d.accept())
    pg.goto(BASE+"/sign-in"); pg.click('button[type=submit]'); pg.wait_for_function("location.pathname.startsWith('/dashboard')")
    pg.goto(BASE+"/dashboard/appointments"); pg.wait_for_selector("text=Quick Book"); pg.wait_for_timeout(1500)
    pg.click("text=Today >> nth=0"); pg.wait_for_timeout(500)
    n0=pg.locator("button:has-text('Confirm') >> text=/^.?\\s*Confirm$/").count()
    pg.locator("button:has-text('✓ Confirm')").first.click(); pg.wait_for_timeout(1500)
    st=pg.evaluate("JSON.parse(localStorage.getItem('hospital-cart-demo:v1'))")
    changed=[a for a in st['appointments'] if a['status']=='CONFIRMED']
    print("confirm buttons before:", n0, "| after:", pg.locator("button:has-text('✓ Confirm')").count(), "| CONFIRMED in store:", len(changed))
    # responsive
    for name,(w,h) in {"desktop":(1440,900),"tablet":(820,1100),"mobile":(390,844)}.items():
        c=b.new_context(viewport={"width":w,"height":h}); q=c.new_page()
        q.goto(BASE+"/sign-in"); q.screenshot(path=f"/home/claude/r_{name}_signin.png")
        q.click('button[type=submit]'); q.wait_for_function("location.pathname.startsWith('/dashboard')"); q.wait_for_timeout(2500)
        sw=q.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        q.screenshot(path=f"/home/claude/r_{name}_overview.png")
        print(f"{name:8} {w}px  page scrollWidth={sw[0]} viewport={sw[1]}  horizontal overflow={'YES' if sw[0]>sw[1]+1 else 'no'}")
        c.close()
    b.close()

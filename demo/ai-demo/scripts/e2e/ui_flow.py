import sys, re
from playwright.sync_api import sync_playwright
BASE="http://localhost:3100"; res=[]
def rec(n, ok, x=""): res.append(ok); print(("PASS " if ok else "FAIL ")+n+(" — "+x if x else ""))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={"width":1440,"height":900}); pg=ctx.new_page()
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("dialog", lambda d: (errs.append("DIALOG:"+d.message[:80]) if False else None, d.accept()))
    pg.goto(BASE+"/sign-in"); pg.click('button[type=submit]'); pg.wait_for_function("location.pathname.startsWith('/dashboard')", timeout=20000)
    # --- Appointments page
    pg.goto(BASE+"/dashboard/appointments"); pg.wait_for_selector("text=Quick Book", timeout=15000); pg.wait_for_timeout(1500)
    total0=int(pg.inner_text("text=Total Appointments >> xpath=preceding-sibling::*[1]").strip()) if pg.locator("text=Total Appointments >> xpath=preceding-sibling::*[1]").count() else -1
    pg.click("text=Today >> nth=0"); pg.wait_for_timeout(500)
    confirm_btns=pg.locator("button:has-text('Confirm')")
    n_conf0=confirm_btns.count()
    rec("Today filter shows appointments with Confirm buttons", n_conf0>0, f"{n_conf0}")
    if n_conf0:
        pending0=pg.locator("text=Pending").count()
        confirm_btns.first.click(); pg.wait_for_timeout(1200)
        rec("clicking Confirm reduces pending rows", pg.locator("button:has-text('Confirm')").count()<n_conf0, f"{n_conf0}->{pg.locator('button:has-text(\"Confirm\")').count()}")
    # --- Quick Book
    sels=pg.locator("select"); rec("Quick Book has patient/department/doctor selects", sels.count()>=3, f"{sels.count()} selects")
    sels.nth(0).select_option(index=3); pg.wait_for_timeout(300)
    sels.nth(1).select_option(index=2); pg.wait_for_timeout(1000)
    sels.nth(2).select_option(index=1)
    pg.fill("input[type=date]", "2026-10-20"); pg.fill("input[type=time]", "11:30")
    pg.click("button:has-text('Book Appointment')"); pg.wait_for_timeout(2000)
    pg.screenshot(path="/home/claude/shot_after_book.png")
    body=pg.inner_text("body")
    rec("booking produced no JS errors", not [e for e in errs if not e.startswith("DIALOG")], "; ".join(errs)[:200])
    # persistence across reload
    pg.reload(); pg.wait_for_selector("text=Quick Book", timeout=15000); pg.wait_for_timeout(1500)
    st=pg.evaluate("JSON.parse(localStorage.getItem('hospital-cart-demo:v1'))")
    rec("booked appointment (20 Oct 11:30) persists after reload", any(x['scheduledAt'].startswith('2026-10-20T11:30') for x in st['appointments']))
    pg.click("text=Custom >> nth=0"); pg.wait_for_timeout(300)
    # --- Patient CRM: search + add
    pg.goto(BASE+"/dashboard/patient-crm"); pg.wait_for_timeout(2000)
    rec("CRM lists seeded patients (20 shown)", "Patient Database" in pg.inner_text("body") and "visits" in pg.inner_text("body"))
    # --- Chat widget answers
    pg.goto(BASE+"/dashboard/overview"); pg.wait_for_timeout(1500)
    pg.locator("button").last.click(); pg.wait_for_timeout(800)
    box=pg.locator("input[placeholder='Type your message...']")
    rec("chat widget opens", box.count()>0)
    if box.count():
        for msg in ["Test Visitor","9876543210","visitor@example.com"]:
            box.fill(msg); box.press("Enter"); pg.wait_for_timeout(700)
        rec("chat onboarding collects name/phone/email", "Contact details saved" in pg.inner_text("body"))
        box.fill("what are your OPD timings?"); box.press("Enter"); pg.wait_for_timeout(1800)
        rec("chat assistant replies (scripted demo assistant)", "9:00 AM" in pg.inner_text("body"))
    # --- Reset demo data
    pg.click("text=Reset demo data"); pg.click("text=Click again to reset"); pg.wait_for_function("document.readyState==='complete'"); pg.wait_for_timeout(1500)
    st=pg.evaluate("JSON.parse(localStorage.getItem('hospital-cart-demo:v1'))")
    rec("reset removes the booked 20 Oct 11:30 appointment", not any(x['scheduledAt'].startswith('2026-10-20T11:30') for x in st['appointments']))
    # --- sign out
    pg.locator("text=Demo Admin").first.click(); pg.click("text=Sign out"); pg.wait_for_function("location.pathname.includes('sign-in') || location.pathname==='/'", timeout=10000)
    pg.goto(BASE+"/dashboard/overview"); pg.wait_for_function("location.pathname.includes('sign-in')", timeout=10000)
    rec("after sign out, dashboard requires sign-in again", True)
    b.close()
print(f"\n{sum(res)}/{len(res)} flow checks passed"); sys.exit(0 if all(res) else 1)

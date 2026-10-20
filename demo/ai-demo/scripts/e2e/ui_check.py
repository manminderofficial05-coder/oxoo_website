import json, sys
from playwright.sync_api import sync_playwright
BASE="http://localhost:3100"
res=[]
def rec(name, ok, extra=""):
    res.append((name, ok, extra)); print(("PASS " if ok else "FAIL ")+name+(" — "+extra if extra else ""))
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={"width":1440,"height":900})
    page=ctx.new_page()
    errors=[]; reqs=[]
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append("console:"+m.text) if m.type=="error" else None)
    page.on("request", lambda r: reqs.append(r.url))
    # 1. unauthenticated dashboard -> sign-in
    page.goto(BASE+"/dashboard/overview"); page.wait_for_function("location.pathname.includes('sign-in')", timeout=15000)
    rec("unauthenticated /dashboard redirects to sign-in", "/sign-in" in page.url)
    page.screenshot(path="/home/claude/shot_signin.png")
    # 2. wrong password
    page.fill('input[type=password]', 'wrong'); page.click('button[type=submit]')
    page.wait_for_selector("text=Invalid email or password", timeout=8000)
    rec("wrong password shows error", True)
    # 3. correct login
    page.fill('input[type=password]', 'demo1234'); page.click('button[type=submit]')
    page.wait_for_function("location.pathname.startsWith('/dashboard')", timeout=20000)
    page.wait_for_selector("text=Demo Environment", timeout=10000)
    rec("demo login reaches dashboard with Demo Environment badge", True)
    page.wait_for_timeout(2500)
    page.screenshot(path="/home/claude/shot_overview.png")
    body=page.inner_text("body")
    rec("overview shows hospital name", "City Hospital" in body)
    rec("overview not stuck loading/erroring", "Failed" not in body, body[:0])
    # 4. every sidebar page renders without page errors
    for path in ["overview","ai-chat","voice-ai","appointments","patient-crm","leads","conversations","agents","assignment","sequences","settings","billing","notifications"]:
        errors.clear()
        page.goto(f"{BASE}/dashboard/{path}"); page.wait_for_timeout(1800)
        txt=page.inner_text("body")
        rec(f"/dashboard/{path} renders (no JS errors)", len(txt)>200 and not any("pageerror" in e or "TypeError" in e for e in errors) and not errors, "; ".join(errors)[:200])
        page.screenshot(path=f"/home/claude/shot_{path}.png")
    # 5. no network call to any /api or external host
    ext=[u for u in reqs if not u.startswith(BASE)]
    api=[u for u in reqs if "/api/" in u]
    rec("no external network requests", len(ext)==0, ", ".join(sorted(set(ext)))[:200])
    rec("no /api requests reached the network (served in-browser)", len(api)==0, ", ".join(api[:3]))
    # 6. refresh nested route keeps session
    page.goto(BASE+"/dashboard/appointments"); page.reload(); page.wait_for_timeout(1500)
    rec("refresh on nested route keeps session", "/dashboard/appointments" in page.url)
    b.close()
fails=[r for r in res if not r[1]]
print(f"\n{len(res)-len(fails)}/{len(res)} UI checks passed"); sys.exit(1 if fails else 0)

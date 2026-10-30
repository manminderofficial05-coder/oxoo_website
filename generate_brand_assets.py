import os
from PIL import Image, ImageOps
import numpy as np

def generate_assets():
    # Primary Source Image
    src_png = os.path.abspath('frontend/public/app-logos/primepro_logo.png')
    src_jpg = os.path.abspath(r'C:\Users\rupin\.gemini\antigravity\brain\d73c7d97-44ea-4ad7-8582-a733bef6c990\.user_uploaded\media_1793376581081_345e7c15.jpg')

    if os.path.exists(src_png):
        img_src = Image.open(src_png).convert('RGBA')
    else:
        img_src = Image.open(src_jpg).convert('RGBA')

    print(f"Loaded master source image: {img_src.size}")

    # Build anti-aliased transparent RGBA
    arr = np.array(img_src, dtype=float)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

    # White distance
    dist = 255.0 - np.minimum(np.minimum(r, g), b)
    # Smooth alpha ramp
    alpha = np.clip(dist * 9.5, 0, 255)
    alpha_norm = np.clip(alpha / 255.0, 1e-4, 1.0)
    r_clean = np.clip((r - (1.0 - alpha_norm) * 255.0) / alpha_norm, 0, 255)
    g_clean = np.clip((g - (1.0 - alpha_norm) * 255.0) / alpha_norm, 0, 255)
    b_clean = np.clip((b - (1.0 - alpha_norm) * 255.0) / alpha_norm, 0, 255)

    trans_master = Image.fromarray(np.dstack([r_clean, g_clean, b_clean, alpha]).astype(np.uint8), 'RGBA')

    # Dark background version (white text & navy elements converted to #FFFFFF)
    # Detect cyan: high green & blue, low red
    is_cyan = (g_clean > 120) & (b_clean > 155)
    is_navy = (alpha > 40) & (~is_cyan)

    r_dark = np.where(is_navy, 255, r_clean)
    g_dark = np.where(is_navy, 255, g_clean)
    b_dark = np.where(is_navy, 255, b_clean)
    dark_master = Image.fromarray(np.dstack([r_dark, g_dark, b_dark, alpha]).astype(np.uint8), 'RGBA')

    # Bounding boxes in 1549x1015 coordinates
    # PP icon: x=570..967 (w=398), y=259..535 (h=277)
    # Wordmark: x=302..1216 (w=915), y=560..715 (h=156)
    # Tagline: x=230..1312 (w=1083), y=737..784 (h=48)
    # Full logo: x=225..1317, y=254..788

    crop_full = (220, 250, 1322, 792)
    crop_pp = (568, 257, 969, 537)
    crop_wm = (300, 558, 1218, 717)
    crop_tag = (228, 735, 1314, 786)

    # 1. Full Stacked Logo (Light & Dark)
    full_light = trans_master.crop(crop_full)
    full_dark = dark_master.crop(crop_full)

    # Full with solid white background
    full_whitebg = Image.new('RGB', full_light.size, (255, 255, 255))
    full_whitebg.paste(full_light, (0, 0), full_light)

    # 2. Components
    pp_light = trans_master.crop(crop_pp)
    pp_dark = dark_master.crop(crop_pp)

    wm_light = trans_master.crop(crop_wm)
    wm_dark = dark_master.crop(crop_wm)

    tag_light = trans_master.crop(crop_tag)
    tag_dark = dark_master.crop(crop_tag)

    # 3. Horizontal Layout for Website Headers & Navigation
    # Text block: wordmark + gap + tagline
    text_w = max(wm_light.width, tag_light.width) # 1086
    gap_y = 14
    text_h = wm_light.height + gap_y + tag_light.height # 159 + 14 + 51 = 224

    # Scale PP icon to match text_h
    pp_aspect = pp_light.width / pp_light.height # 401 / 280 = 1.432
    pp_target_h = text_h
    pp_target_w = int(pp_target_h * pp_aspect)

    pp_resized_light = pp_light.resize((pp_target_w, pp_target_h), Image.Resampling.LANCZOS)
    pp_resized_dark = pp_dark.resize((pp_target_w, pp_target_h), Image.Resampling.LANCZOS)

    spacing = 45
    horiz_w = pp_target_w + spacing + text_w
    horiz_h = text_h

    # Light Horizontal
    horiz_light = Image.new('RGBA', (horiz_w, horiz_h), (0, 0, 0, 0))
    horiz_light.paste(pp_resized_light, (0, 0), pp_resized_light)
    wm_x = pp_target_w + spacing + (text_w - wm_light.width) // 2
    horiz_light.paste(wm_light, (wm_x, 0), wm_light)
    tag_x = pp_target_w + spacing + (text_w - tag_light.width) // 2
    horiz_light.paste(tag_light, (tag_x, wm_light.height + gap_y), tag_light)

    # Dark Horizontal
    horiz_dark = Image.new('RGBA', (horiz_w, horiz_h), (0, 0, 0, 0))
    horiz_dark.paste(pp_resized_dark, (0, 0), pp_resized_dark)
    horiz_dark.paste(wm_dark, (wm_x, 0), wm_dark)
    horiz_dark.paste(tag_dark, (tag_x, wm_dark.height + gap_y), tag_dark)

    # 4. Compact Sidebar Logo (PP Icon + "PrimePro" Wordmark, no tagline)
    sb_text_h = wm_light.height
    sb_pp_w = int(sb_text_h * pp_aspect)
    sb_pp_light = pp_light.resize((sb_pp_w, sb_text_h), Image.Resampling.LANCZOS)
    sb_pp_dark = pp_dark.resize((sb_pp_w, sb_text_h), Image.Resampling.LANCZOS)
    sb_spacing = 30
    sb_w = sb_pp_w + sb_spacing + wm_light.width
    sb_h = sb_text_h

    sidebar_light = Image.new('RGBA', (sb_w, sb_h), (0, 0, 0, 0))
    sidebar_light.paste(sb_pp_light, (0, 0), sb_pp_light)
    sidebar_light.paste(wm_light, (sb_pp_w + sb_spacing, 0), wm_light)

    sidebar_dark = Image.new('RGBA', (sb_w, sb_h), (0, 0, 0, 0))
    sidebar_dark.paste(sb_pp_dark, (0, 0), sb_pp_dark)
    sidebar_dark.paste(wm_dark, (sb_pp_w + sb_spacing, 0), wm_dark)

    # 5. Square PP Icon for Favicons, PWAs, Social Avatars (512x512)
    def make_square_icon(src_icon, size=512, padding_pct=0.12):
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        max_dim = int(size * (1.0 - 2 * padding_pct))
        ratio = min(max_dim / src_icon.width, max_dim / src_icon.height)
        new_w = int(src_icon.width * ratio)
        new_h = int(src_icon.height * ratio)
        resized = src_icon.resize((new_w, new_h), Image.Resampling.LANCZOS)
        x_off = (size - new_w) // 2
        y_off = (size - new_h) // 2
        canvas.paste(resized, (x_off, y_off), resized)
        return canvas

    icon_512 = make_square_icon(pp_light, 512, 0.10)
    icon_192 = make_square_icon(pp_light, 192, 0.10)
    icon_64 = make_square_icon(pp_light, 64, 0.08)
    icon_32 = make_square_icon(pp_light, 32, 0.06)
    icon_16 = make_square_icon(pp_light, 16, 0.05)

    # 6. Social Share / Open Graph Image (1200x630)
    og_img = Image.new('RGB', (1200, 630), (8, 43, 104)) # #082B68 Deep Navy
    # Center full_dark or full_light with white background card
    card_w, card_h = 960, 480
    card = Image.new('RGB', (card_w, card_h), (255, 255, 255))
    # Scale full_light into card
    scale = min((card_w - 120) / full_light.width, (card_h - 100) / full_light.height)
    og_logo = full_light.resize((int(full_light.width * scale), int(full_light.height * scale)), Image.Resampling.LANCZOS)
    card.paste(og_logo, ((card_w - og_logo.width)//2, (card_h - og_logo.height)//2), og_logo)
    og_img.paste(card, ((1200 - card_w)//2, (630 - card_h)//2))

    # Destinations to write
    dest_dirs = [
        'frontend/public',
        'frontend/public/brand',
        'frontend/public/app-logos',
        'backend/src/assets'
    ]
    for d in dest_dirs:
        os.makedirs(d, exist_ok=True)

    # Save to frontend/public
    full_light.save('frontend/public/primepro-logo.png')
    full_light.save('frontend/public/primepro-logo-transparent.png')
    full_whitebg.save('frontend/public/primepro-logo-whitebg.png')
    full_dark.save('frontend/public/primepro-logo-white.png')
    full_dark.save('frontend/public/primepro-logo-darkbg.png')

    horiz_light.save('frontend/public/primepro-logo-horizontal.png')
    horiz_dark.save('frontend/public/primepro-logo-horizontal-white.png')

    sidebar_light.save('frontend/public/primepro-logo-sidebar.png')
    sidebar_dark.save('frontend/public/primepro-logo-sidebar-white.png')

    icon_512.save('frontend/public/primepro-icon.png')
    icon_512.save('frontend/public/pwa-512.png')
    icon_192.save('frontend/public/pwa-192.png')
    icon_64.save('frontend/public/favicon.png')
    icon_512.save('frontend/public/favicon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64)])

    og_img.save('frontend/public/primepro-og-image.png')

    # Save to frontend/public/brand
    full_light.save('frontend/public/brand/primepro-logo.png')
    full_light.save('frontend/public/brand/primepro-logo-clean.png')
    full_dark.save('frontend/public/brand/primepro-logo-white.png')
    horiz_light.save('frontend/public/brand/primepro-logo-horizontal.png')
    horiz_dark.save('frontend/public/brand/primepro-logo-horizontal-white.png')
    icon_512.save('frontend/public/brand/primepro-icon.png')

    # Save to backend/src/assets for PDFKit & server-side rendering
    full_light.save('backend/src/assets/primepro-logo.png')
    full_whitebg.save('backend/src/assets/primepro-logo-whitebg.png')
    horiz_light.save('backend/src/assets/primepro-logo-horizontal.png')
    icon_512.save('backend/src/assets/primepro-icon.png')

    # Also overwrite old oxoo filenames in frontend/public so any hardcoded or cached assets display PrimePro!
    full_light.save('frontend/public/oxoo-logo.png')
    full_dark.save('frontend/public/oxoo-logo-white.png')
    full_light.save('frontend/public/oxoo-logo-clean.png')
    horiz_light.save('frontend/public/oxoo-logo-horizontal.png')
    horiz_dark.save('frontend/public/oxoo-logo-horizontal-white.png')
    sidebar_dark.save('frontend/public/oxoo-logo-sidebar.png')
    icon_512.save('frontend/public/oxoo-logo-symbol.png')
    icon_512.save('frontend/public/oxoo-icon.png')
    full_light.save('frontend/public/oxoo-logo-tagline.png')
    full_light.save('frontend/public/oxoo-logo-tagline-trans.png')
    full_light.save('frontend/public/oxoo-logo-original.png')

    full_light.save('frontend/public/brand/oxoo-logo.png')
    full_light.save('frontend/public/brand/oxoo-logo-clean.png')
    full_dark.save('frontend/public/brand/oxoo-logo-white.png')

    # Sub-demos:
    demo_dirs = [
        'frontend/public/ai-demo',
        'frontend/public/finance-demo',
        'frontend/public/hrms-demo',
        'frontend/public/sales-demo'
    ]
    for dd in demo_dirs:
        if os.path.exists(dd):
            full_light.save(os.path.join(dd, 'logo.png'))
            full_light.save(os.path.join(dd, 'primepro-logo.png'))
            if os.path.exists(os.path.join(dd, 'oxoo-logo.png')):
                full_light.save(os.path.join(dd, 'oxoo-logo.png'))
            if os.path.exists(os.path.join(dd, 'favicon.ico')):
                icon_512.save(os.path.join(dd, 'favicon.ico'), format='ICO', sizes=[(16,16), (32,32)])
            if os.path.exists(os.path.join(dd, 'favicon.png')):
                icon_64.save(os.path.join(dd, 'favicon.png'))

    print("Successfully generated and deployed all PrimePro brand assets across the entire project!")

if __name__ == '__main__':
    generate_assets()

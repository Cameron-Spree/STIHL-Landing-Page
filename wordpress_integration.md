# Integration Guide - STIHL Battery Systems Landing Page

This guide explains the step-by-step process of adding the STIHL Battery Systems landing page to your **WordPress WooCommerce** website.

---

## Step 1: Upload Your Assets to WordPress

For the video players and backgrounds to load correctly, you need to upload the media assets to your WordPress Media Library:

1. Log in to your WordPress dashboard.
2. Go to **Media** > **Add New Media File**.
3. Upload the following files from your local project directory:
   - `AK30S_16x9_EN_HQ_VA_2024-11_0001_Global_129097.mp4` (AK 30 S Battery Video)
   - `AP500S_16x9_GB_HQ_VA_2024-11_0001_Global_129096.mp4` (AP 500 S Battery Video)
   - `stihl_ak_system_hero.png` (AK System Hero visual)
   - `stihl_ap_system_hero.png` (AP System Hero visual)
4. Once uploaded, click on each file and **copy the full File URL** (e.g. `https://briantsofrisborough.co.uk/wp-content/uploads/2026/06/...`).

---

## Step 2: Choose Your Embedding Method

We have provided two formats of the landing page:
- **Method A (Easiest)**: Copy-pasting the single self-contained file (`stihl-battery-landing-page-embed.html`).
- **Method B (Cleanest)**: Uploading separate CSS and JS files and embedding only the HTML.

### Method A: Single-File Embed (Gutenberg / Elementor / Divi)

This method embeds the HTML, CSS, and JS all in one block.

#### 1. In Block Editor (Gutenberg)
1. Create a new page or edit an existing page in WordPress (e.g., "STIHL Battery Systems").
2. Set the Page Template in the right-hand panel to **"Theme Full Width"** or **"No Sidebar"** if available.
3. Click the **`+`** icon to add a new block, search for **Custom HTML**, and select it.
4. Open the local file `stihl-battery-landing-page-embed.html`, copy the **entire content**, and paste it into the Custom HTML block.
5. Click **Preview** to verify the styling.

#### 2. In Elementor
1. Edit your page with Elementor.
2. Add a new 1-column section, set the Content Width to **Full Width**, and remove column gap padding if necessary.
3. Drag the **HTML Code** widget into the section.
4. Copy the entire contents of `stihl-battery-landing-page-embed.html` and paste it into the HTML Code input box.

---

### Method B: Separate CSS/JS Files (Advanced Developer Setup)

If you prefer to keep your page clean and load assets via WordPress files:

1. Upload `stihl-battery-landing-page.css` and `stihl-battery-landing-page.js` to your child theme folder (e.g., `/wp-content/themes/storefront-child/js/` and `/wp-content/themes/storefront-child/css/`).
2. Enqueue the files in your child theme's `functions.php`:
   ```php
   function enqueue_stihl_landing_page_styles() {
       if (is_page('stihl-battery-systems')) { // Replace with your page slug
           wp_enqueue_style('stihl-lp-css', get_stylesheet_directory_uri() . '/css/stihl-battery-landing-page.css', array(), '1.0.0');
           wp_enqueue_script('stihl-lp-js', get_stylesheet_directory_uri() . '/js/stihl-battery-landing-page.js', array(), '1.0.0', true);
       }
   }
   add_action('wp_enqueue_scripts', 'enqueue_stihl_landing_page_styles');
   ```
3. In your Page Builder or Gutenberg Editor, add a **Custom HTML** block and paste *only* the HTML structure (lines 10 to 451 of `index.html`) without the stylesheets or script enqueues.

---

## Step 3: Update Asset URLs in the Code

After pasting the HTML code, you **must update the video and image sources** with the URLs you copied in Step 1.

Search for the following tags in the pasted code and replace the source path with the live WordPress URL:

1. **AK System video** (Line ~65 in the embed code):
   ```html
   <!-- Replace the relative path with your WordPress Media Library URL -->
   <video src="https://briantsofrisborough.co.uk/wp-content/uploads/..." loop muted playsinline preload="metadata"></video>
   ```

2. **AP System video** (Line ~95 in the embed code):
   ```html
   <!-- Replace the relative path with your WordPress Media Library URL -->
   <video src="https://briantsofrisborough.co.uk/wp-content/uploads/..." loop muted playsinline preload="metadata"></video>
   ```

---

## Step 4: Customize WooCommerce Product Links

We have pre-filled standard WooCommerce URL paths matching your site structure. However, please double-check the exact paths for your shop. 

Search the HTML code for the links (`href="..."`) and adjust if your URLs are different:

- **AK Category Link** (Lines ~82 and ~302 in the embed code):
  `https://briantsofrisborough.co.uk/product-category/garden-machinery/cordless-machinery/stihl-ak-system/`
- **AP Category Link** (Lines ~112 and ~375 in the embed code):
  `https://briantsofrisborough.co.uk/product-category/garden-machinery/cordless-machinery/stihl-ap-system/`
- **Showroom Contact Link** (Line ~432 in the embed code):
  `https://briantsofrisborough.co.uk/contact-us/`
- **Product Details Link**:
  Review the product showcase grid (lines ~180 to ~280) and make sure the `href` on each product card's "Buy Now" link matches your WooCommerce product slug (e.g. `/shop/garden-machinery/lawnmowers/stihl-rma-235-cordless-lawnmower/`).

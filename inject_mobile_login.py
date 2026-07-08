import os

html_files = ['frontend/index.html', 'frontend/music.html', 'frontend/dashboard.html', 'frontend/login.html']

for file_path in html_files:
    if not os.path.exists(file_path): continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<a href="login.html">Portal Musisi / Login</a>' in content:
        continue
    
    # We want to insert the link before the closing </div> of mobile-menu.
    # A simple way is to replace the Cari Lagu link or add it at the bottom of the menu.
    target_string = '<a href="music.html">Cari Lagu</a>\n</div>'
    replacement = '<a href="music.html">Cari Lagu</a>\n  <a href="login.html" class="mobile-login-btn" style="color:var(--brand); font-weight:600;">Portal Musisi / Login</a>\n</div>'
    
    if target_string in content:
        content = content.replace(target_string, replacement)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        # For dashboard.html which might not have "Cari Lagu" exactly or login.html
        target_string2 = '</div>'
        # find the mobile-menu div
        if '<div id="mobile-menu"' in content:
            # this is harder, just use a different target if needed
            print(f"Could not find target string in {file_path}")

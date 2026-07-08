import re

file_path = 'frontend/admin.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dashboard.js with admin.js
content = content.replace('src="js/dashboard.js?v=4"', 'src="js/admin.js"')

# Replace Dashboard Musisi with Admin Dashboard
content = content.replace('Dashboard Musisi', 'Admin Dashboard')

admin_html = """
<main id="app-content">
  <div class="dashboard-page wrap">
    <div class="sec-head" style="display:flex; justify-content:space-between; align-items:center;">
      <h1 class="display">Admin Dashboard</h1>
      <button class="btn-cta" onclick="logout()">Logout</button>
    </div>
    
    <div class="dash-layout">
      <!-- SIDEBAR ADMIN -->
      <aside class="dash-sidebar">
        <nav class="dash-nav">
          <button class="dash-tab active" data-target="stats">Stats</button>
          <button class="dash-tab" data-target="users">Users</button>
          <button class="dash-tab" data-target="songs">Songs</button>
          <button class="dash-tab" data-target="events">Events</button>
        </nav>
      </aside>

      <!-- KONTEN ADMIN -->
      <main class="dash-content">
        
        <!-- STATS SECTION -->
        <section id="stats" class="active">
          <div class="dash-box">
            <h2 class="sec-head" style="margin-bottom: 24px;">STATISTIK APLIKASI</h2>
            <div class="stats-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:20px;">
              <div class="stat-card" style="padding:20px; background:var(--ink); border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
                <h3 style="font-size:14px; opacity:0.7;">Total Musisi</h3>
                <div id="stat-users" style="font-size:32px; font-weight:700; color:var(--brand);">0</div>
              </div>
              <div class="stat-card" style="padding:20px; background:var(--ink); border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
                <h3 style="font-size:14px; opacity:0.7;">Total Lagu</h3>
                <div id="stat-songs" style="font-size:32px; font-weight:700; color:var(--brand);">0</div>
              </div>
              <div class="stat-card" style="padding:20px; background:var(--ink); border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
                <h3 style="font-size:14px; opacity:0.7;">Total Event</h3>
                <div id="stat-events" style="font-size:32px; font-weight:700; color:var(--brand);">0</div>
              </div>
              <div class="stat-card" style="padding:20px; background:var(--ink); border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
                <h3 style="font-size:14px; opacity:0.7;">Total Pengunjung</h3>
                <div id="stat-visitors" style="font-size:32px; font-weight:700; color:var(--brand);">0</div>
              </div>
            </div>
          </div>
        </section>

        <!-- USERS SECTION -->
        <section id="users" style="display:none;">
          <div class="dash-box">
            <h2 class="sec-head" style="margin-bottom: 24px;">MANAJEMEN USER</h2>
            <div style="overflow-x:auto;">
              <table style="width:100%; text-align:left; border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                    <th style="padding:12px;">Email</th>
                    <th style="padding:12px;">Role</th>
                    <th style="padding:12px;">Artist Name</th>
                    <th style="padding:12px;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="admin-users-list"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- SONGS SECTION -->
        <section id="songs" style="display:none;">
          <div class="dash-box">
            <h2 class="sec-head" style="margin-bottom: 24px;">MANAJEMEN LAGU</h2>
            <div style="overflow-x:auto;">
              <table style="width:100%; text-align:left; border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                    <th style="padding:12px;">Judul</th>
                    <th style="padding:12px;">Artist</th>
                    <th style="padding:12px;">Release Date</th>
                    <th style="padding:12px;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="admin-songs-list"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- EVENTS SECTION -->
        <section id="events" style="display:none;">
          <div class="dash-box">
            <h2 class="sec-head" style="margin-bottom: 24px;">MANAJEMEN EVENT</h2>
            <div style="overflow-x:auto;">
              <table style="width:100%; text-align:left; border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
                    <th style="padding:12px;">Nama Event</th>
                    <th style="padding:12px;">Lokasi</th>
                    <th style="padding:12px;">Tanggal</th>
                    <th style="padding:12px;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="admin-events-list"></tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
  
  <script>
    // Simple tab logic
    document.querySelectorAll('.dash-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dash-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('section').forEach(s => s.style.display = 'none');
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).style.display = 'block';
      });
    });
  </script>
</main>
"""

# Find everything from <main id="app-content"> to </main>
pattern = re.compile(r'<main id="app-content">.*?</main>', re.DOTALL)
new_content = pattern.sub(admin_html, content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Admin HTML generated successfully!")

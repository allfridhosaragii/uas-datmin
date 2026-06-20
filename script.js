// Elements
const stepNav = document.getElementById('step-nav');
const outputContent = document.getElementById('output-content');
const viewTitle = document.getElementById('view-title');

// Initialize
function init() {
    if (typeof dashboardData === 'undefined') {
        outputContent.innerHTML = '<div class="output-empty">Data dashboard belum siap. Harap generate dashboard_data.js terlebih dahulu.</div>';
        return;
    }

    // Attach event listeners to sidebar items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Update active class
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Render content
            const view = item.getAttribute('data-view');
            const titleHTML = item.innerHTML; // Copy icon and text
            renderView(view, titleHTML);
        });
    });

    // Load default view (dashboard)
    renderView('dashboard', '<i class="fas fa-home"></i> Dashboard');
}

function renderView(viewName, titleHTML) {
    viewTitle.innerHTML = titleHTML;
    outputContent.classList.remove('fade-in');
    void outputContent.offsetWidth; // Trigger reflow
    outputContent.innerHTML = '';

    if (viewName === 'dashboard') {
        const sum = dashboardData.summary;
        outputContent.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card">
                    <i class="fas fa-bed"></i>
                    <h3>Total Booking</h3>
                    <div class="metric-value">${sum.total_booking}</div>
                </div>
                <div class="metric-card">
                    <i class="fas fa-shopping-basket"></i>
                    <h3>Total Frequent Itemsets</h3>
                    <div class="metric-value">${sum.total_frequent_itemsets}</div>
                </div>
                <div class="metric-card">
                    <i class="fas fa-project-diagram"></i>
                    <h3>Total Association Rules</h3>
                    <div class="metric-value">${sum.total_rules}</div>
                </div>
                <div class="metric-card">
                    <i class="fas fa-percentage"></i>
                    <h3>Min Support</h3>
                    <div class="metric-value">${sum.min_support}</div>
                </div>
                <div class="metric-card">
                    <i class="fas fa-bullseye"></i>
                    <h3>Min Confidence</h3>
                    <div class="metric-value">${sum.min_confidence}</div>
                </div>
            </div>
            <div style="text-align: center; color: rgba(255,255,255,0.7); margin-top: 40px; padding: 20px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px;">
                <i class="fas fa-chart-pie" style="font-size: 3rem; margin-bottom: 15px; color: var(--accent-1); opacity: 0.8;"></i>
                <h2>Dashboard Apriori Hotel Booking</h2>
                <p>Silakan navigasi menggunakan menu di sebelah kiri untuk melihat detail frequent itemsets, aturan asosiasi, visualisasi, dan insight bisnis.</p>
            </div>
        `;
    } 
    else if (viewName === 'frequent_itemsets') {
        outputContent.innerHTML = `
            <div style="margin-bottom: 20px; color: rgba(255,255,255,0.8);">
                Tabel di bawah ini menampilkan kombinasi atribut (itemsets) yang paling sering muncul secara bersamaan di dalam dataset pemesanan hotel.
            </div>
            <div class="output-html">${dashboardData.frequent_itemsets}</div>
        `;
    } 
    else if (viewName === 'association_rules') {
        outputContent.innerHTML = `
            <h3 style="margin-top: 0; color: var(--accent-1);">Top 10 Rules by Confidence</h3>
            <div style="margin-bottom: 20px; color: rgba(255,255,255,0.8);">
                10 aturan asosiasi terbaik yang menunjukkan hubungan terkuat antar atribut pelanggan.
            </div>
            <div class="output-html" style="margin-bottom: 40px;">${dashboardData.top_10_rules}</div>
            
            <h3 style="color: var(--accent-1);">Semua Association Rules</h3>
            <div class="output-html">${dashboardData.association_rules}</div>
        `;
    } 
    else if (viewName === 'cancel_rules') {
        outputContent.innerHTML = `
            <div style="margin-bottom: 20px; color: rgba(255,255,255,0.8); background: rgba(255,50,50,0.1); padding: 15px; border-left: 4px solid #ff4d4d; border-radius: 4px;">
                <strong>Insight Fokus Pembatalan:</strong> Tabel di bawah memfilter aturan-aturan yang secara spesifik berujung pada <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">cancel_status_Canceled_Yes</code> (Pelanggan Membatalkan Booking).
            </div>
            <div class="output-html">${dashboardData.cancel_rules}</div>
        `;
    } 
    else if (viewName === 'visualizations') {
        if (dashboardData.visualizations && dashboardData.visualizations.length > 0) {
            dashboardData.visualizations.forEach(base64 => {
                const img = document.createElement('img');
                img.className = 'output-image';
                img.src = 'data:image/png;base64,' + base64;
                img.style.marginBottom = '30px';
                img.style.border = '1px solid rgba(255,255,255,0.1)';
                img.style.borderRadius = '12px';
                img.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                outputContent.appendChild(img);
            });
        } else {
            outputContent.innerHTML = '<div class="output-empty">Tidak ada visualisasi tersedia.</div>';
        }
    } 
    else if (viewName === 'business_insights') {
        outputContent.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px;">
                <h3 style="color: var(--accent-1); margin-top: 0; margin-bottom: 20px; font-size: 1.4rem;">
                    <i class="fas fa-robot"></i> Rekomendasi & Insight Otomatis
                </h3>
                <div class="output-text" style="font-size: 1.05rem; line-height: 1.8; color: #eee; white-space: pre-wrap;">${dashboardData.business_insights}</div>
            </div>
        `;
    }

    outputContent.classList.add('fade-in');
}

document.addEventListener('DOMContentLoaded', init);

<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaviClean - Gestão de Limpezas</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#2563EB',
                        success: '#10B981',
                        warning: '#F59E0B',
                        error: '#EF4444',
                        'bg-app': '#F8FAFC',
                    },
                    borderRadius: {
                        '3xl': '24px',
                        '4xl': '32px',
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Menu Sidebar Animation */
        #mobile-menu {
            transform: translateX(-100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #mobile-menu.open {
            transform: translateX(0);
        }
        #menu-overlay {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
        }
        #menu-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        /* Toast Animation */
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .toast-active {
            animation: slideInUp 0.3s ease-out forwards;
        }
    </style>
</head>
<body class="bg-slate-100 flex justify-center">
    <!-- Notifications Container -->
    <div id="toast-container" class="fixed top-5 right-5 z-[100] space-y-3 pointer-events-none max-w-[300px]"></div>

    <div class="w-full max-w-md min-h-screen bg-[#F8FAFC] shadow-2xl relative flex flex-col overflow-hidden border-x border-slate-200">
        
        <!-- Sidebar Menu Overlay -->
        <div id="menu-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]" onclick="toggleMenu()"></div>
        
        <!-- Sidebar Menu -->
        <aside id="mobile-menu" class="fixed left-0 top-0 bottom-0 w-72 bg-white z-[90] shadow-2xl p-6 flex flex-col">
            <div class="flex items-center justify-between mb-10">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <i data-lucide="sparkles" size="20" fill="white"></i>
                    </div>
                    <span class="font-extrabold text-xl text-slate-800 tracking-tight">TaviClean</span>
                </div>
                <button onclick="toggleMenu()" class="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <nav class="flex-1 space-y-1">
                <a href="index.php" class="flex items-center gap-4 p-4 rounded-2xl group transition-all <?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'; ?>">
                    <i data-lucide="layout-grid"></i>
                    <span class="font-bold text-sm tracking-tight">Painel Principal</span>
                </a>
                <a href="agendamentos.php" class="flex items-center gap-4 p-4 rounded-2xl group transition-all <?php echo basename($_SERVER['PHP_SELF']) == 'agendamentos.php' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'; ?>">
                    <i data-lucide="calendar"></i>
                    <span class="font-bold text-sm tracking-tight">Agenda Digital</span>
                </a>
                <a href="clientes.php" class="flex items-center gap-4 p-4 rounded-2xl group transition-all <?php echo basename($_SERVER['PHP_SELF']) == 'clientes.php' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'; ?>">
                    <i data-lucide="users"></i>
                    <span class="font-bold text-sm tracking-tight">Clientes</span>
                </a>
                <a href="equipa.php" class="flex items-center gap-4 p-4 rounded-2xl group transition-all <?php echo basename($_SERVER['PHP_SELF']) == 'equipa.php' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'; ?>">
                    <i data-lucide="shield-check"></i>
                    <span class="font-bold text-sm tracking-tight">Equipa & Logs</span>
                </a>
                <a href="ganhos.php" class="flex items-center gap-4 p-4 rounded-2xl group transition-all <?php echo basename($_SERVER['PHP_SELF']) == 'ganhos.php' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'; ?>">
                    <i data-lucide="wallet"></i>
                    <span class="font-bold text-sm tracking-tight">Financeiro</span>
                </a>
            </nav>

            <div class="pt-6 border-t border-slate-100">
                <a href="logout.php" class="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                    <i data-lucide="log-out"></i>
                    <span>Sair da Conta</span>
                </a>
            </div>
        </aside>

        <!-- Scripts do Menu e Notificações -->
        <script>
            function toggleMenu() {
                const menu = document.getElementById('mobile-menu');
                const overlay = document.getElementById('menu-overlay');
                menu.classList.toggle('open');
                overlay.classList.toggle('open');
            }

            function showToast(message, type = 'success') {
                const container = document.getElementById('toast-container');
                const toast = document.createElement('div');
                toast.className = `p-4 rounded-2xl shadow-xl border flex items-center gap-3 transition-all pointer-events-auto toast-active ${
                    type === 'success' ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700'
                }`;
                
                const icon = type === 'success' ? 'check-circle' : 'alert-circle';
                toast.innerHTML = `
                    <i data-lucide="${icon}" size="20"></i>
                    <span class="text-xs font-bold">${message}</span>
                    <button onclick="this.parentElement.remove()" class="ml-auto p-1 opacity-50 hover:opacity-100">
                        <i data-lucide="x" size="14"></i>
                    </button>
                `;
                
                container.appendChild(toast);
                lucide.createIcons();

                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(20px)';
                    setTimeout(() => toast.remove(), 400);
                }, 4000);
            }

            // Mensagem de boas-vindas se for a primeira vez na sessão
            window.addEventListener('load', () => {
                if (!sessionStorage.getItem('welcomeShown')) {
                    showToast('Bem-vindo de volta ao TaviClean! ✨');
                    sessionStorage.setItem('welcomeShown', 'true');
                }
            });
        </script>

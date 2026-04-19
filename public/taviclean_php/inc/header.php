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
                        primary: '#3182CE',
                        success: '#48BB78',
                        pending: '#ED8936',
                        completed: '#38A169',
                        'bg-app': '#F7FAFC',
                        'text-main': '#1A202C',
                        'text-sub': '#718096',
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #F7FAFC; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Menu Sidebar Animation */
        #mobile-menu {
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
        }
        #mobile-menu.open {
            transform: translateX(0);
        }
        #menu-overlay {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease-in-out;
        }
        #menu-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        /* Toast Animation */
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .toast-active {
            animation: slideInRight 0.4s ease forwards;
        }
    </style>
</head>
<body class="bg-gray-50 flex justify-center">
    <!-- Notifications Container -->
    <div id="toast-container" class="fixed top-5 right-5 z-[100] space-y-3 pointer-events-none"></div>

    <div class="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col overflow-hidden">
        
        <!-- Sidebar Menu Overlay -->
        <div id="menu-overlay" class="fixed inset-0 bg-black/50 z-[80]" onclick="toggleMenu()"></div>
        
        <!-- Sidebar Menu -->
        <aside id="mobile-menu" class="fixed left-0 top-0 bottom-0 w-72 bg-white z-[90] shadow-2xl p-6 flex flex-col">
            <div class="flex items-center justify-between mb-10">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                        <i data-lucide="sparkles" size="18"></i>
                    </div>
                    <span class="font-bold text-lg text-gray-800">TaviClean</span>
                </div>
                <button onclick="toggleMenu()" class="p-2 text-gray-400">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <nav class="flex-1 space-y-2">
                <a href="index.php" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                    <i data-lucide="layout-dashboard"></i>
                    <span class="font-bold">Painel</span>
                </a>
                <a href="agendamentos.php" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                    <i data-lucide="calendar"></i>
                    <span class="font-bold">Agenda</span>
                </a>
                <a href="clientes.php" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                    <i data-lucide="users"></i>
                    <span class="font-bold">Clientes</span>
                </a>
                <a href="equipa.php" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                    <i data-lucide="shield-check"></i>
                    <span class="font-bold">Equipa</span>
                </a>
                <a href="ganhos.php" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all">
                    <i data-lucide="wallet"></i>
                    <span class="font-bold">Ganhos</span>
                </a>
            </nav>

            <div class="pt-6 border-t border-gray-100">
                <a href="logout.php" class="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all">
                    <i data-lucide="log-out"></i>
                    <span class="font-bold">Sair</span>
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

<?php
require_once 'config.php';
require_once 'inc/upload_helper.php';
check_auth();
$conn = get_db_connection();

// Forçar Log Manual
if (isset($_POST['force_log'])) {
    $msg = $_POST['log_message'] ?? 'Log manual forçado pelo administrador.';
    write_log($msg, 'manual');
    set_flash_message("Log registado com sucesso!");
    header("Location: equipa.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_member'])) {
    $id = uniqid();
    $name = $_POST['name'];
    $role = $_POST['role'];
    
    $photo = upload_image($_FILES['photo'] ?? null);
    if (!$photo) {
        $photo = "https://picsum.photos/seed/" . urlencode($name) . "/100/100";
    }

    $stmt = $conn->prepare("INSERT INTO team (id, name, role, photo) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $id, $name, $role, $photo);
    $stmt->execute();
}

$team = $conn->query("SELECT * FROM team ORDER BY name ASC");

include 'inc/header.php';
?>

<header class="bg-white h-20 flex items-end justify-between px-5 pb-4 border-b border-slate-100 z-30 shrink-0 sticky top-0">
    <button onclick="toggleMenu()" class="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
        <i data-lucide="menu"></i>
    </button>
    <div class="flex flex-col items-center">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TaviClean</span>
        <h1 class="text-lg font-bold text-slate-800 tracking-tight">Equipa & Logs</h1>
    </div>
    <div class="w-10"></div>
</header>

<main class="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-24">
    <!-- Center of Operations / Logs -->
    <section class="space-y-4">
        <div class="flex items-center gap-2">
            <i data-lucide="cpu" size="14" class="text-primary"></i>
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Centro de Operações</h3>
        </div>
        
        <div class="bg-slate-900 rounded-[32px] p-6 text-white space-y-4 shadow-2xl border border-slate-800 shadow-slate-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span class="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Sistema Online</span>
                </div>
                <i data-lucide="terminal" size="16" class="text-slate-500"></i>
            </div>
            
            <div class="h-44 overflow-y-auto font-mono text-[10px] space-y-2 no-scrollbar bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                <?php
                $log_file = __DIR__ . '/debug.log';
                if (file_exists($log_file)) {
                    $logs = array_reverse(file($log_file));
                    foreach (array_slice($logs, 0, 15) as $line) {
                        $parts = explode(']', $line, 2);
                        if (count($parts) > 1) {
                            echo '<div class="flex gap-2">';
                            echo '<span class="text-slate-600 shrink-0">' . htmlspecialchars(trim($parts[0], '[')) . '</span>';
                            echo '<span class="text-slate-300">' . htmlspecialchars(ltrim($parts[1])) . '</span>';
                            echo '</div>';
                        } else {
                            echo '<div class="text-slate-400">' . htmlspecialchars($line) . '</div>';
                        }
                    }
                } else {
                    echo "<div class='text-slate-600 flex items-center gap-2 italic'><i data-lucide='info' size='12'></i> A aguardar registos...</div>";
                }
                ?>
            </div>

            <form method="POST" class="flex gap-2">
                <input type="text" name="log_message" placeholder="Comando manual..." 
                    class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-600">
                <button type="submit" name="force_log" class="p-3 bg-primary rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                    <i data-lucide="send" size="18"></i>
                </button>
            </form>
        </div>
    </section>

    <!-- Team Section -->
    <section class="space-y-4">
        <div class="flex justify-between items-center px-2">
            <div class="flex items-center gap-2">
                <i data-lucide="users" size="14" class="text-primary"></i>
                <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Gestão de Pessoal</h3>
            </div>
            <button onclick="document.getElementById('add-modal').classList.remove('hidden')" class="text-primary font-bold text-[10px] flex items-center gap-1 bg-primary/10 px-3 py-2 rounded-xl group hover:bg-primary hover:text-white transition-all">
                <i data-lucide="plus-circle" size="14"></i> NOVO MEMBRO
            </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <?php while($m = $team->fetch_assoc()): ?>
                <div class="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-3 group hover:border-primary/30 transition-all">
                    <div class="relative">
                        <div class="w-16 h-16 rounded-[24px] bg-slate-50 overflow-hidden shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
                            <img src="<?php echo htmlspecialchars($m['photo']); ?>" class="w-full h-full object-cover">
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h4 class="font-extrabold text-sm text-slate-800"><?php echo htmlspecialchars($m['name']); ?></h4>
                        <p class="text-[9px] text-primary font-bold uppercase tracking-widest mt-1"><?php echo htmlspecialchars($m['role']); ?></p>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </section>

    <!-- Extra Links -->
    <div class="space-y-3 px-2 pt-4">
        <a href="ganhos.php" class="bg-white p-4 rounded-[24px] border border-slate-100 flex items-center justify-between group">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <i data-lucide="bar-chart-3" size="18"></i>
                </div>
                <span class="font-bold text-sm text-slate-800">Relatório de Rendimentos</span>
            </div>
            <i data-lucide="chevron-right" size="16" class="text-slate-300"></i>
        </a>
    </div>
</main>

<!-- Add Member Modal -->
<div id="add-modal" class="hidden fixed inset-0 bg-black/50 z-[70] flex items-end justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-t-[32px] p-8 space-y-6 animate-slide-up">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Novo Funcionário</h2>
            <button onclick="document.getElementById('add-modal').classList.add('hidden')" class="p-2">
                <i data-lucide="x"></i>
            </button>
        </div>
        <form method="POST" enctype="multipart/form-data" class="space-y-4">
            <input type="hidden" name="add_member" value="1">
            <input type="text" name="name" required placeholder="Nome Completo"
                class="w-full p-4 bg-gray-50 rounded-2xl border focus:border-blue-500 focus:outline-none">
            <input type="text" name="role" required placeholder="Cargo (Ex: Limpeza)"
                class="w-full p-4 bg-gray-50 rounded-2xl border focus:border-blue-500 focus:outline-none">
            
            <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Foto (Opcional)</label>
                <input type="file" name="photo" 
                    class="w-full p-3 bg-gray-50 rounded-2xl border text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            </div>

            <button type="submit" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase shadow-xl">Adicionar</button>
        </form>
    </div>
</div>

<style>
@keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
</style>

<?php include 'inc/footer.php'; ?>

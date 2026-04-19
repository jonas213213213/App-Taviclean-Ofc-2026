<?php
require_once 'config.php';
require_once 'inc/upload_helper.php';
check_auth();
$conn = get_db_connection();

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

<header class="bg-white px-5 pt-10 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
    <a href="index.php" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
        <i data-lucide="arrow-left"></i>
    </a>
    <h1 class="text-lg font-bold text-gray-800">Equipa & Mais</h1>
    <div class="w-10"></div>
</header>

<main class="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-24">
    <!-- Team Section -->
    <section class="space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">A Minha Equipa</h3>
            <button onclick="document.getElementById('add-modal').classList.remove('hidden')" class="text-blue-500 font-bold text-xs flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-xl">
                <i data-lucide="plus" size="14"></i> Adicionar
            </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <?php while($m = $team->fetch_assoc()): ?>
                <div class="bg-white border border-gray-100 p-4 rounded-3xl flex flex-col items-center text-center space-y-3">
                    <div class="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shadow-sm ring-4 ring-gray-50">
                        <?php 
                            $photo_src = $m['photo'];
                            if (strpos($photo_src, 'http') === false) {
                                $photo_src = $photo_src; // Local path
                            }
                        ?>
                        <img src="<?php echo $photo_src; ?>" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h4 class="font-bold text-sm"><?php echo htmlspecialchars($m['name']); ?></h4>
                        <p class="text-[10px] text-gray-400 font-medium uppercase tracking-tighter"><?php echo htmlspecialchars($m['role']); ?></p>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </section>

    <!-- App Actions -->
    <section class="space-y-3">
        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Configurações</h3>
        <div class="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50">
            <a href="ganhos.php" class="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4 font-bold">
                    <div class="p-3 bg-blue-100 text-blue-500 rounded-2xl">
                        <i data-lucide="wallet" size="20"></i>
                    </div>
                    Meus Ganhos
                </div>
                <i data-lucide="chevron-right" size="20"></i>
            </a>
            <a href="logout.php" class="flex items-center justify-between p-5 hover:bg-red-50 text-red-500 transition-colors">
                <div class="flex items-center gap-4 font-bold">
                    <div class="p-3 bg-red-100 rounded-2xl">
                        <i data-lucide="pause" size="20"></i>
                    </div>
                    Terminar Sessão
                </div>
                <i data-lucide="chevron-right" size="20"></i>
            </a>
        </div>
    </section>
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

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 h-20 flex items-center justify-around px-2 z-40">
    <a href="index.php" class="flex flex-col items-center gap-1 text-gray-400">
        <i data-lucide="layout-dashboard"></i>
        <span class="text-[10px]">Painel</span>
    </a>
    <a href="agendamentos.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500">
        <i data-lucide="calendar"></i>
        <span class="text-[10px]">Agenda</span>
    </a>
    <a href="clientes.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500">
        <i data-lucide="user"></i>
        <span class="text-[10px]">Clientes</span>
    </a>
    <a href="equipa.php" class="flex flex-col items-center gap-1 text-blue-600 font-bold">
        <i data-lucide="layout-grid"></i>
        <span class="text-[10px]">Mais</span>
    </a>
</nav>

<?php include 'inc/footer.php'; ?>
